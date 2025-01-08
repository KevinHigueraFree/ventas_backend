import { exit } from 'node:process'
import db from '../config/db'

const clearDB = async () => {
    try {
        await db.sync({ force: true })// limpia data base
        console.log('datos eliminados');
        exit(0); // finaliza el programa but do it good
    } catch (error) {
        console.log(error);
        exit(1)// finaliza the program but do it bad, had errors
    }
}

//? process.argv[ ]: is a comnad executed since cln or comand live tools of node js
if(process.argv[2]==='--clear'){
    clearDB();
}
