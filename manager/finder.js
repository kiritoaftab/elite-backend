
export const findById = async(model, id, populateFields = [],modelName, res) => {
    let query = model.findById(id);

    if (populateFields.length > 0) {
        populateFields.forEach(field => {
            query = query.populate(field);
        });
    }

    const document = await query.exec();

    if (!document) {
        
        return res.status(404).json({
            success:false,
            msg:`${modelName} not found ${id}`
        })
    }

    return document;
}

export const findAll = async(model,populateFields =[],modelName,res) => {
    let query = model.find({});

    if(populateFields.length > 0){
        populateFields.forEach(field => {
            query = query.populate(field)
        })
    }

    const document = await query.exec();

    if (!document) {
        
        return res.status(404).json({
            success:false,
            msg:`${modelName} data not found`
        })
    }

    return document;

}


export const paginate = async (model, query, options = {}) => {
        const page = parseInt(options.page) || 1;
        const pageSize = parseInt(options.pageSize) || 10;
        const sortField = options.sortField || "_id"; // Default sort by _id if not provided
        const sortOrder = options.sortOrder || "asc";
        const populateFields = options.populateFields || [];

        const sort = {};
        sort[sortField] = sortOrder === "asc" ? 1 : -1;

        const startIndex = (page - 1) * pageSize;

        const totalDocuments = await model.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / pageSize);

        let dbQuery = model.find(query).sort(sort).skip(startIndex).limit(pageSize);

        if (populateFields.length > 0) {
            populateFields.forEach(field => {
                dbQuery = dbQuery.populate(field);
            });
        }

        const documents = await dbQuery.exec();

        return {
            documents,
            pagination: {
                page,
                pageSize,
                totalPages,
                totalDocuments,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
}

export const findByUserId = async(model,userId,modelName,res) => {
    let query = model.findOne({user:userId}).populate("user");

    const document = await query.exec();
    if(!document){
        console.log(`Did not find ${modelName} for user ${userId}`);
        return res.status(404).json({
            success:false,
            msg:`Did not find ${modelName} for user ${userId}`
        })
    }
    return document;
}