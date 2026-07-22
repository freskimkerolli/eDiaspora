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
    isAdmin: row.is_admin,
    businessVerified: row.business_verified,
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
    isAdmin: "is_admin",
    businessVerified: "business_verified",
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
    city: row.city,
    country: row.country,
    featured: row.featured,
    expiresAt: row.expires_at,
    status: row.status,
    renewedAt: row.renewed_at,
    createdAt: row.created_at,
  };
}

export async function createPost(post) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, title, category, subcategory, type, description, price, photos, city, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      post.city || null,
      post.country || null,
    ],
  );
  return mapPostRow(rows[0]);
}

export async function updatePost(id, userId, post) {
  const { rows } = await pool.query(
    `UPDATE posts SET title = $1, category = $2, subcategory = $3, type = $4,
       description = $5, price = $6, photos = $7, city = $8, country = $9
     WHERE id = $10 AND user_id = $11
     RETURNING *`,
    [
      post.title,
      post.category,
      post.subcategory,
      post.type,
      post.description,
      post.price,
      post.photos,
      post.city || null,
      post.country || null,
      id,
      userId,
    ],
  );
  return mapPostRow(rows[0]);
}

export async function listPosts({ category, city, minPrice, maxPrice, search } = {}) {
  const clauses = ["status = 'active'"];
  const values = [];

  if (category) {
    values.push(category);
    clauses.push(`category = $${values.length}`);
  }
  if (city) {
    values.push(`%${city}%`);
    clauses.push(`city ILIKE $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    clauses.push(`NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    clauses.push(`NULLIF(regexp_replace(price, '[^0-9.]', '', 'g'), '')::numeric <= $${values.length}`);
  }

  const { rows } = await pool.query(
    `SELECT * FROM posts WHERE ${clauses.join(" AND ")} ORDER BY featured DESC, created_at DESC`,
    values,
  );
  return rows.map(mapPostRow);
}

export async function incrementPostClicks(id) {
  const { rows } = await pool.query(
    "UPDATE posts SET clicks = clicks + 1 WHERE id = $1 RETURNING *",
    [id],
  );
  return mapPostRow(rows[0]);
}

export async function findPostById(id) {
  const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
  return mapPostRow(rows[0]);
}

export async function listPostsByUser(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map(mapPostRow);
}

export async function setPostFeatured(id, featured) {
  const { rows } = await pool.query(
    "UPDATE posts SET featured = $1 WHERE id = $2 RETURNING *",
    [featured, id],
  );
  return mapPostRow(rows[0]);
}

export async function renewPost(id, userId) {
  const { rows } = await pool.query(
    `UPDATE posts SET expires_at = now() + interval '60 days', status = 'active', renewed_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId],
  );
  return mapPostRow(rows[0]);
}

export async function expireOverduePosts() {
  await pool.query(
    "UPDATE posts SET status = 'expired' WHERE status = 'active' AND expires_at < now()",
  );
}

export async function deletePost(id) {
  await pool.query("DELETE FROM posts WHERE id = $1", [id]);
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

export async function setContactMessageThreadToken(id, token) {
  const { rows } = await pool.query(
    "UPDATE contact_messages SET thread_token = $1 WHERE id = $2 RETURNING *",
    [token, id],
  );
  return mapMessageRow(rows[0]);
}

export async function findContactMessageByThreadToken(token) {
  const { rows } = await pool.query(
    "SELECT * FROM contact_messages WHERE thread_token = $1",
    [token],
  );
  return mapMessageRow(rows[0]);
}

function mapReplyRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    contactMessageId: row.contact_message_id,
    sender: row.sender,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function addMessageReply({ contactMessageId, sender, body }) {
  const { rows } = await pool.query(
    `INSERT INTO message_replies (contact_message_id, sender, body)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [contactMessageId, sender, body],
  );
  return mapReplyRow(rows[0]);
}

export async function listMessageReplies(contactMessageId) {
  const { rows } = await pool.query(
    "SELECT * FROM message_replies WHERE contact_message_id = $1 ORDER BY created_at ASC",
    [contactMessageId],
  );
  return rows.map(mapReplyRow);
}

// --- Favorites ---

function mapFavoriteRow(row) {
  if (!row) return null;
  return { id: row.id, userId: row.user_id, postId: row.post_id, createdAt: row.created_at };
}

export async function addFavorite(userId, postId) {
  const { rows } = await pool.query(
    `INSERT INTO favorites (user_id, post_id) VALUES ($1, $2)
     ON CONFLICT (user_id, post_id) DO NOTHING
     RETURNING *`,
    [userId, postId],
  );
  return mapFavoriteRow(rows[0]);
}

export async function removeFavorite(userId, postId) {
  await pool.query("DELETE FROM favorites WHERE user_id = $1 AND post_id = $2", [
    userId,
    postId,
  ]);
}

export async function listFavoritePostsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT posts.* FROM favorites
     JOIN posts ON posts.id = favorites.post_id
     WHERE favorites.user_id = $1
     ORDER BY favorites.created_at DESC`,
    [userId],
  );
  return rows.map(mapPostRow);
}

export async function listFavoritePostIdsByUser(userId) {
  const { rows } = await pool.query(
    "SELECT post_id FROM favorites WHERE user_id = $1",
    [userId],
  );
  return rows.map((row) => row.post_id);
}

// --- Reviews ---

function mapReviewRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    targetUserId: row.target_user_id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function createReview(review) {
  const { rows } = await pool.query(
    `INSERT INTO reviews (target_user_id, reviewer_name, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [review.targetUserId, review.reviewerName, review.rating, review.comment || null],
  );
  return mapReviewRow(rows[0]);
}

export async function listReviewsByUser(userId) {
  const { rows } = await pool.query(
    "SELECT * FROM reviews WHERE target_user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map(mapReviewRow);
}

export async function getReviewSummary(userId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average FROM reviews WHERE target_user_id = $1",
    [userId],
  );
  return { count: rows[0].count, average: rows[0].average };
}

// --- Reports ---

function mapReportRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    postId: row.post_id,
    reporterName: row.reporter_name,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createReport(report) {
  const { rows } = await pool.query(
    `INSERT INTO reports (post_id, reporter_name, reason)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [report.postId, report.reporterName || null, report.reason],
  );
  return mapReportRow(rows[0]);
}

export async function listReports({ status } = {}) {
  if (status) {
    const { rows } = await pool.query(
      "SELECT * FROM reports WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    return rows.map(mapReportRow);
  }
  const { rows } = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
  return rows.map(mapReportRow);
}

export async function setReportStatus(id, status) {
  const { rows } = await pool.query(
    "UPDATE reports SET status = $1 WHERE id = $2 RETURNING *",
    [status, id],
  );
  return mapReportRow(rows[0]);
}

// --- Admin ---

export async function listAllUsers() {
  const { rows } = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

export async function listAllPostsForAdmin() {
  const { rows } = await pool.query(
    "SELECT * FROM posts ORDER BY created_at DESC",
  );
  return rows.map(mapPostRow);
}
