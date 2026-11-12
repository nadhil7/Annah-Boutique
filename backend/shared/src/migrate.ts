import {readdir, readFile} from 'node:fs/promises';import {Pool} from 'pg';
const pool=new Pool({connectionString:process.env.DATABASE_URL});
try{const directory=new URL('../../db/migrations/',import.meta.url);const files=(await readdir(directory)).filter((file)=>file.endsWith('.sql')).sort();for(const file of files){await pool.query(await readFile(new URL(file,directory),'utf8'));console.log(`Applied migration ${file}`);}}finally{await pool.end()}
