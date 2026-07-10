import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    userType: row.user_type,
    company: row.company,
    isVerified: row.is_verified,
    verificationToken: row.verification_token,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE lower(email) = lower($1)",
    [email],
  );
  return mapRow(rows[0]);
}

export async function findUserByVerificationToken(token) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE verification_token = $1",
    [token],
  );
  return mapRow(rows[0]);
}

export async function createUser(user) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, user_type, company, is_verified, verification_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      user.name,
      user.email,
      user.passwordHash,
      user.userType,
      user.company,
      user.isVerified,
      user.verificationToken,
    ],
  );
  return mapRow(rows[0]);
}

export async function updateUser(id, updates) {
  const columnMap = {
    name: "name",
    email: "email",
    passwordHash: "password_hash",
    userType: "user_type",
    company: "company",
    isVerified: "is_verified",
    verificationToken: "verification_token",
  };

  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    const column = columnMap[key];
    if (!column) continue;
    fields.push(`${column} = $${i}`);
    values.push(value);
    i += 1;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
    values,
  );
  return mapRow(rows[0]);
}
