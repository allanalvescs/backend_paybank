const validate = (schema) => async (req, res, next) => {
    const resource = req.body;

    try {
        await schema.validate(resource);

        next()
    } catch (e) {
        return res.status(422).json({ message: e.errors.join(', ') })
    }
}

module.exports = validate