let idCount = 0;

export const getId = () => {
    ++idCount;
    console.log(`ID: ${idCount}`);
    return idCount;
}