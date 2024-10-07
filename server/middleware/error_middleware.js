

const errorMiddleware = (error, req, res, next) => {
    res.status(res.statusCode || 500).json({
        success: false,
        message: error.message || "Something went wrong",
        stack: error.stack
    });
};

export default errorMiddleware;
