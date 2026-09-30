// temp helper (not committed): read-only SQL runner
import { readFileSync } from 'node:fs'
import pg from 'pg'
const env = Object.fromEntries(readFileSync('.env','utf8').split('\n').map(l=>l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,'')]))
const c = new pg.Client({ connectionString: env[process.env.URLVAR||"DATABASE_URL"], ssl: { rejectUnauthorized: false } })
await c.connect()
await c.query('begin read only')
const sql = process.argv[2]
try { const r = await c.query(sql); console.log(JSON.stringify(r.rows, null, 0).replace(/\},\{/g,'},\n{')) } catch(e){ console.error('ERR', e.message) }
await c.query('rollback'); await c.end()
