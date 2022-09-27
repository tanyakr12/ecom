class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex : this.queryStr.keyword, // mongodb ka function hai
                $options:"i" // case insensetive
            }
        } : {};
        this.query = this.query.find({...keyword});
        return this;
    }

    filter() {
        const queryCopy = {...this.queryStr} // javascript mei objects reference ke through pass hote hai to agar this.queryStr direct likha to queryCopy mei change original queryStr mei bhi reflect honge isiliye use object destructuring

        // removing some fields for category
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key]);

        // filter for price and rating
        let queryStr = JSON.stringify(queryCopy);

        // console.log(queryStr); // {"category":"Sample","price":{"gt":"200","lt":"1000"}}

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`) // adding '$' symbol to convert parameter into mongo commands

        // console.log(queryStr); // {"category":"Sample","price":{"$gt":"200","$lt":"1000"}}

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1); // counting the number of products to be skipped
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this
    }
}

module.exports = ApiFeatures