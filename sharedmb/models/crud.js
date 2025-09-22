/**
 * @file This module provides a set of helper functions for interacting with Mongoose models.
 * All data manipulation functions are written using async/await syntax but also support
 * the traditional callback pattern for backward compatibility.
 * Each async function will also return a promise, which resolves with the data on success
 * or rejects with an error.
 */

const mongoose = require("mongoose");

/**
 * Creates a new document in the database.
 * @param {object} data - The data for the new document.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.create = async function (data, schema, callBack) {
    try {
        const result = await schema.create(data);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds documents that match the specified criteria.
 * @param {object} data - The query criteria.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, Array<object>): void} [callBack] - Optional callback function.
 * @returns {Promise<Array<object>>}
 */
module.exports.find = async function (data, schema, callBack) {
    try {
        const result = await schema.find(data);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds a single document by its ID.
 * @param {string | mongoose.Types.ObjectId} id - The document ID.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findById = async function (id, schema, callBack) {
    try {
        const result = await schema.findById(id);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds a document by its ID and updates it.
 * @param {string | mongoose.Types.ObjectId} id - The document ID.
 * @param {object} data - The update data.
 * @param {object} options - Mongoose query options (e.g., { new: true }).
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findByIdAndUpdate = async function (
    id,
    data,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.findByIdAndUpdate(id, data, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds a document by its ID and removes it.
 * @param {string | mongoose.Types.ObjectId} id - The document ID.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findByIdAndRemove = async function (id, schema, callBack) {
    try {
        const result = await schema.findByIdAndRemove(id);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Updates documents that match the condition. Note: Deprecated in Mongoose. Use updateOne or updateMany.
 * @param {object} condition - The query conditions.
 * @param {object} data - The update data.
 * @param {object} options - Mongoose query options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.update = async function (
    condition,
    data,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.update(condition, data, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Performs an aggregation query.
 * @param {Array<object>} conditions - The aggregation pipeline stages.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, Array<object>): void} [callBack] - Optional callback function.
 * @returns {Promise<Array<object>>}
 */
module.exports.aggregation = async function (conditions, schema, callBack) {
    try {
        const result = await schema.aggregate(conditions).exec();
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Inserts multiple documents.
 * @param {Array<object>} data - An array of documents to insert.
 * @param {object} options - Mongoose insertMany options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, Array<object>): void} [callBack] - Optional callback function.
 * @returns {Promise<Array<object>>}
 */
module.exports.insertMany = async function (data, options, schema, callBack) {
    try {
        const result = await schema.insertMany(data, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds one document and updates it.
 * @param {object} condition - The query conditions.
 * @param {object} update - The update data.
 * @param {object} options - Mongoose query options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findOneAndUpdate = async function (
    condition,
    update,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema
            .findOneAndUpdate(condition, update, options)
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds the first document that matches the condition.
 * @param {object} condition - The query conditions.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findOne = async function (condition, schema, callBack) {
    try {
        const result = await schema.findOne(condition).exec();
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds one document and removes it.
 * @param {object} conditions - The query conditions.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findOneAndRemove = async function (
    conditions,
    schema,
    callBack
) {
    try {
        const result = await schema.findOneAndRemove(conditions);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Updates a single document that matches the condition.
 * @param {object} condition - The query conditions.
 * @param {object} data - The update data.
 * @param {object} options - Mongoose query options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.updateOne = async function (
    condition,
    data,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.updateOne(condition, data, options).exec();
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds documents with specific fields (projection) and sorting.
 * @param {object} condition - The query conditions.
 * @param {object} projection - The fields to include or exclude.
 * @param {object} options - Mongoose query options (e.g., sort, limit).
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, Array<object>): void} [callBack] - Optional callback function.
 * @returns {Promise<Array<object>>}
 */
module.exports.findProjectionOptionAndSort = async function (
    condition,
    projection,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.find(condition, projection, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Finds a single document with specific fields (projection) and sorting.
 * @param {object} condition - The query conditions.
 * @param {object} projection - The fields to include or exclude.
 * @param {object} options - Mongoose query options (e.g., sort).
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.findOneProjectionOptionAndSort = async function (
    condition,
    projection,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.findOne(condition, projection, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Checks if a given string is a valid MongoDB ObjectId.
 * @param {string} id - The ID to validate.
 * @returns {boolean}
 */
module.exports.validId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Updates multiple documents that match the condition.
 * @param {object} condition - The query conditions.
 * @param {object} data - The update data.
 * @param {object} options - Mongoose query options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.updateMany = async function (
    condition,
    data,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.updateMany(condition, data, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Creates a new document with options.
 * @param {object | Array<object>} data - The data for the new document(s).
 * @param {object} options - Mongoose create options.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.createWthOption = async function (
    data,
    options,
    schema,
    callBack
) {
    try {
        const result = await schema.create(data, options);
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};

/**
 * Deletes a single document that matches the condition.
 * @param {object} condition - The query conditions.
 * @param {mongoose.Model} schema - The Mongoose model.
 * @param {function(Error, object): void} [callBack] - Optional callback function.
 * @returns {Promise<object>}
 */
module.exports.deleteOne = async function (condition, schema, callBack) {
    try {
        const result = await schema.deleteOne(condition).exec();
        if (callBack) callBack(null, result);
        return result;
    } catch (error) {
        if (callBack) callBack(error, null);
        throw error;
    }
};
