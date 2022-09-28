const yup = require('yup');

const UserSchema = yup.object().shape({
    name: yup.string().required().min(2, 'Insert a real name'),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    cel: yup.string().length(9).required()
})

const singInSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
})

module.exports = { UserSchema, singInSchema }