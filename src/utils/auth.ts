import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
    //minetras mas rondas a genSalt se el agreguen sera mas seguro
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const checkPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash)
}