class ApiError extends Error {
    constructor(
        message="Something went wrong",
        statusCode,
        errors=[],
        statck=""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data=null;
        this.message=false;
        this.success=false;
        this.errors=errors;
        if(statck){
            this.statck=statck;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError}