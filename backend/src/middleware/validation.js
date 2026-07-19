const { body, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        
        res.status(400).json({ errors: errors.array() });
    };
};

const bookingValidation = [
    body('customer_name').notEmpty().withMessage('Name is required'),
    body('customer_email').isEmail().withMessage('Valid email is required'),
    body('customer_phone').notEmpty().withMessage('Phone number is required'),
    body('service_id').isInt().withMessage('Valid service is required'),
    body('booking_date').isDate().withMessage('Valid date is required'),
    body('booking_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required')
];

module.exports = { validate, bookingValidation };