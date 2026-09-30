const dbConfig = require("../config/db");

class FirestoreQuery {
  constructor(executeFn) {
    this.executeFn = executeFn;
    this._sort = null;
    this._limit = null;
  }

  sort(config) {
    this._sort = config;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  async execute() {
    let results = await this.executeFn();

    // Sort in-memory
    if (this._sort) {
      const field = Object.keys(this._sort)[0];
      const dir = this._sort[field]; // -1 or desc, 1 or asc
      results.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) return dir === -1 || dir === "desc" ? 1 : -1;
        if (valA > valB) return dir === -1 || dir === "desc" ? -1 : 1;
        return 0;
      });
    }

    // Limit in-memory
    if (this._limit) {
      results = results.slice(0, this._limit);
    }

    return results;
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

class FirestoreQuerySingle {
  constructor(executeFn) {
    this.executeFn = executeFn;
  }

  select(fields) {
    // Mock select method used in User select("+password")
    return this;
  }

  async execute() {
    return await this.executeFn();
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

class FirestoreModel {
  constructor(collectionName, schema = {}, preSave = null, methods = {}) {
    this.collectionName = collectionName;
    this.schema = schema;
    this.preSave = preSave;
    this.methods = methods;
  }

  instantiate(docId, data) {
    if (!data) return null;
    const instance = {
      _id: docId,
      id: docId,
      ...data
    };

    // Attach methods
    for (const [name, fn] of Object.entries(this.methods)) {
      instance[name] = fn.bind(instance);
    }

    // Attach save()
    instance.save = async () => {
      let dataToSave = { ...instance };
      delete dataToSave._id;
      delete dataToSave.id;
      delete dataToSave.save;
      for (const name of Object.keys(this.methods)) {
        delete dataToSave[name];
      }

      if (this.preSave) {
        const context = {
          ...dataToSave,
          isModified: (field) => {
            if (field === "password") {
              return dataToSave.password && !dataToSave.password.startsWith("$2");
            }
            return true;
          }
        };
        await this.preSave.call(context);
        Object.assign(dataToSave, context);
        delete dataToSave.isModified;
      }

      dataToSave.updatedAt = new Date();
      if (!dataToSave.createdAt) {
        dataToSave.createdAt = new Date();
      }

      // Update instance timestamps
      instance.createdAt = dataToSave.createdAt;
      instance.updatedAt = dataToSave.updatedAt;
      // Remove undefined values to ensure Firestore compatibility
      const sanitizedData = {};
      for (const [k, v] of Object.entries(dataToSave)) {
        if (v !== undefined) {
          sanitizedData[k] = v;
        }
      }

      await dbConfig.db.collection(this.collectionName).doc(docId).set(sanitizedData, { merge: true });
      return instance;
    };

    return instance;
  }

  convertTimestamps(data) {
    if (!data) return data;
    const result = { ...data };
    for (const [key, value] of Object.entries(result)) {
      if (value && typeof value === 'object' && typeof value.toDate === 'function') {
        result[key] = value.toDate();
      }
    }
    return result;
  }

  async create(data) {
    const docRef = dbConfig.db.collection(this.collectionName).doc();
    const docId = docRef.id;

    const dataToSave = {};
    for (const [field, config] of Object.entries(this.schema)) {
      if (data[field] !== undefined) {
        dataToSave[field] = data[field];
      } else if (config && config.default !== undefined) {
        if (typeof config.default === "function") {
          dataToSave[field] = config.default();
        } else {
          dataToSave[field] = config.default;
        }
      }
    }

    for (const [field, val] of Object.entries(data)) {
      if (dataToSave[field] === undefined) {
        dataToSave[field] = val;
      }
    }

    const instance = this.instantiate(docId, dataToSave);
    await instance.save();
    return instance;
  }

  find(filter = {}) {
    return new FirestoreQuery(async () => {
      const queryRef = dbConfig.db.collection(this.collectionName);
      const snapshot = await queryRef.get();
      const results = [];
      snapshot.forEach(doc => {
        const data = this.convertTimestamps(doc.data());
        results.push(this.instantiate(doc.id, data));
      });

      // Filter in-memory
      let filtered = results;
      for (const [key, val] of Object.entries(filter)) {
        if (val && typeof val === "object") {
          filtered = filtered.filter(item => {
            const itemVal = item[key];
            if (val.$exists !== undefined) {
              const exists = itemVal !== undefined && itemVal !== null;
              if (exists !== val.$exists) return false;
            }
            if (val.$ne !== undefined) {
              if (itemVal === val.$ne) return false;
            }
            if (val.$in !== undefined && Array.isArray(val.$in)) {
              if (!val.$in.includes(itemVal)) return false;
            }
            if (val.$gt !== undefined) {
              if (!(itemVal > val.$gt)) return false;
            }
            return true;
          });
        } else {
          filtered = filtered.filter(item => item[key] === val);
        }
      }

      return filtered;
    });
  }

  findOne(filter = {}) {
    return new FirestoreQuerySingle(async () => {
      const q = this.find(filter);
      const results = await q.execute();
      return results.length > 0 ? results[0] : null;
    });
  }

  findById(id) {
    return new FirestoreQuerySingle(async () => {
      if (!id) return null;
      const doc = await dbConfig.db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) return null;
      const data = this.convertTimestamps(doc.data());
      return this.instantiate(doc.id, data);
    });
  }

  async findByIdAndUpdate(id, data, options = {}) {
    if (!id) return null;
    const docRef = dbConfig.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const currentData = doc.data();
    const updatedData = { ...currentData, ...data, updatedAt: new Date() };
    const sanitizedData = {};
    for (const [k, v] of Object.entries(updatedData)) {
      if (v !== undefined) {
        sanitizedData[k] = v;
      }
    }

    await docRef.set(sanitizedData, { merge: true });
    return this.instantiate(id, this.convertTimestamps(sanitizedData));
  }

  async findByIdAndDelete(id) {
    if (!id) return;
    await dbConfig.db.collection(this.collectionName).doc(id).delete();
  }

  async countDocuments(filter = {}) {
    const q = this.find(filter);
    const results = await q.execute();
    return results.length;
  }

  async deleteMany() {
    const snapshot = await dbConfig.db.collection(this.collectionName).get();
    const batch = dbConfig.db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async aggregate(pipeline) {
    const q = this.find({});
    let current = await q.execute();

    for (const step of pipeline) {
      if (step.$match) {
        const match = step.$match;
        current = current.filter(item => {
          for (const [key, filterVal] of Object.entries(match)) {
            const itemVal = item[key];
            if (filterVal && typeof filterVal === 'object') {
              if (filterVal.$in) {
                if (!filterVal.$in.includes(itemVal)) return false;
              } else if (filterVal.$ne !== undefined) {
                if (itemVal === filterVal.$ne) return false;
              }
            } else {
              if (itemVal !== filterVal) return false;
            }
          }
          return true;
        });
      }

      if (step.$group) {
        const group = step.$group;
        const idExpr = group._id;

        const groups = {};

        for (const item of current) {
          let groupId;
          if (idExpr === null) {
            groupId = "null";
          } else if (typeof idExpr === 'string' && idExpr.startsWith("$")) {
            groupId = item[idExpr.slice(1)];
          } else if (typeof idExpr === 'object') {
            const resolvedId = {};
            for (const [key, expr] of Object.entries(idExpr)) {
              if (expr && typeof expr === 'object') {
                if (expr.$month && typeof expr.$month === 'string' && expr.$month.startsWith("$")) {
                  const dateVal = item[expr.$month.slice(1)];
                  resolvedId[key] = dateVal instanceof Date ? dateVal.getMonth() + 1 : 1;
                }
                if (expr.$year && typeof expr.$year === 'string' && expr.$year.startsWith("$")) {
                  const dateVal = item[expr.$year.slice(1)];
                  resolvedId[key] = dateVal instanceof Date ? dateVal.getFullYear() : 2026;
                }
              }
            }
            groupId = JSON.stringify(resolvedId);
          } else {
            groupId = "default";
          }

          if (!groups[groupId]) {
            groups[groupId] = {
              _id: idExpr === null ? null : (typeof idExpr === 'object' ? JSON.parse(groupId) : groupId),
              items: []
            };
          }
          groups[groupId].items.push(item);
        }

        const groupedResults = [];
        for (const groupVal of Object.values(groups)) {
          const result = { _id: groupVal._id };
          for (const [key, acc] of Object.entries(group)) {
            if (key === "_id") continue;
            if (acc && typeof acc === 'object') {
              if (acc.$sum) {
                let sumField = acc.$sum;
                if (typeof sumField === 'string' && sumField.startsWith("$")) {
                  const fieldName = sumField.slice(1);
                  result[key] = groupVal.items.reduce((sum, item) => sum + (Number(item[fieldName]) || 0), 0);
                } else if (typeof sumField === 'number') {
                  result[key] = groupVal.items.length * sumField;
                }
              }
            }
          }
          groupedResults.push(result);
        }

        current = groupedResults;
      }

      if (step.$sort) {
        const sort = step.$sort;
        current.sort((a, b) => {
          const getVal = (obj, path) => {
            return path.split('.').reduce((o, key) => (o ? o[key] : null), obj);
          };
          for (const [field, dir] of Object.entries(sort)) {
            const valA = getVal(a, field);
            const valB = getVal(b, field);
            if (valA < valB) return dir === -1 || dir === "desc" ? 1 : -1;
            if (valA > valB) return dir === -1 || dir === "desc" ? -1 : 1;
          }
          return 0;
        });
      }
    }

    return current;
  }
}

module.exports = FirestoreModel;
