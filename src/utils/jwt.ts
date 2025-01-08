import jwt from 'jsonwebtoken';

export const generateJWT = (id: string) => {
    console.log(id);
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '10d',
    })
    return token;

}