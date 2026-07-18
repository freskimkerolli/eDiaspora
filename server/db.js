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
    phone: row.phone,
    address: row.address,
    avatarUrl: row.avatar_url,
    isVerified: row.is_verified,
    verificationToken: row.verification_token,
    resetToken: row.reset_token,
    resetTokenExpires: row.reset_token_expires,
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

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return mapRow(rows[0]);
}

export async function findUserByVerificationToken(token) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE verification_token = $1",
    [token],
  );
  return mapRow(rows[0]);
}

export async function findUserByResetToken(token) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE reset_token = $1",
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
    phone: "phone",
    address: "address",
    avatarUrl: "avatar_url",
    isVerified: "is_verified",
    verificationToken: "verification_token",
    resetToken: "reset_token",
    resetTokenExpires: "reset_token_expires",
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

function mapPostRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    type: row.type,
    description: row.description,
    price: row.price,
    photos: row.photos || [],
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

export async function createPost(post) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, title, category, subcategory, type, description, price, photos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      post.userId,
      post.title,
      post.category,
      post.subcategory,
      post.type,
      post.description,
      post.price,
      post.photos,
    ],
  );
  return mapPostRow(rows[0]);
}

export async function updatePost(id, userId, post) {
  const { rows } = await pool.query(
    `UPDATE posts SET title = $1, category = $2, subcategory = $3, type = $4,
       description = $5, price = $6, photos = $7
     WHERE id = $8 AND user_id = $9
     RETURNING *`,
    [
      post.title,
      post.category,
      post.subcategory,
      post.type,
      post.description,
      post.price,
      post.photos,
      id,
      userId,
    ],
  );
  return mapPostRow(rows[0]);
}

export async function listPosts({ category } = {}) {
  if (category) {
    const { rows } = await pool.query(
      "SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC",
      [category],
    );
    return rows.map(mapPostRow);
  }
  const { rows } = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
  return rows.map(mapPostRow);
}

export async function incrementPostClicks(id) {
  const { rows } = await pool.query(
    "UPDATE posts SET clicks = clicks + 1 WHERE id = $1 RETURNING *",
    [id],
  );
  return mapPostRow(rows[0]);
}

function mapWorkRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    description: row.description,
    photos: row.photos || [],
    createdAt: row.created_at,
  };
}

export async function createCompletedWork(work) {
  const { rows } = await pool.query(
    `INSERT INTO completed_works (user_id, description, photos)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [work.userId, work.description, work.photos],
  );
  return mapWorkRow(rows[0]);
}

export async function listCompletedWorksByUser(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM completed_works WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map(mapWorkRow);
}

function mapMessageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    recipientUserId: row.recipient_user_id,
    senderName: row.sender_name,
    senderContact: row.sender_contact,
    message: row.message,
    reply: row.reply,
    repliedAt: row.replied_at,
    createdAt: row.created_at,
  };
}

export async function createContactMessage(msg) {
  const { rows } = await pool.query(
    `INSERT INTO contact_messages (recipient_user_id, sender_name, sender_contact, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [msg.recipientUserId, msg.senderName, msg.senderContact, msg.message],
  );
  return mapMessageRow(rows[0]);
}

export async function listContactMessagesByUser(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM contact_messages WHERE recipient_user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map(mapMessageRow);
}

export async function findContactMessageById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM contact_messages WHERE id = $1",
    [id],
  );
  return mapMessageRow(rows[0]);
}

export async function replyToContactMessage(id, reply) {
  const { rows } = await pool.query(
    `UPDATE contact_messages SET reply = $1, replied_at = now() WHERE id = $2 RETURNING *`,
    [reply, id],
  );
  return mapMessageRow(rows[0]);
}
