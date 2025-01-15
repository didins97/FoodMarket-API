// success response
const successResponse = (res, status, message, data, statusCode = 200, token = null) => {
    let response = {
        meta: {
            status: status,
            message: message,
            code: statusCode
        },
        data: data
    }

    if (token) {
        response.token = token
    }

    return res.status(statusCode).json(response)
}

// error response
const errorResponse = (res, status, message, error = null, statusCode = 400) => {
    return res.status(statusCode).json({
        meta: {
            status: status,
            message: message,
            code: statusCode
        },
        error: error
    })
}

module.exports = {
    successResponse,
    errorResponse
}