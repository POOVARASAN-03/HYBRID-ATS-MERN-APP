import fs from 'fs';

// Parse PDF resume and extract text
export const parseResume = async (filePath) => {
  try {
    const pdf = await import('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf.default(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume file');
  }
};

// Calculate match score between resume text and job keywords
export const calculateMatchScore = (resumeText, requiredKeywords) => {
  if (!requiredKeywords || requiredKeywords.length === 0) {
    return 0;
  }

  const text = resumeText.toLowerCase();
  const matchedKeywords = requiredKeywords.filter(keyword => 
    text.includes(keyword.toLowerCase())
  );

  const matchScore = (matchedKeywords.length / requiredKeywords.length) * 100;
  return Math.round(matchScore);
};

// Extract skills from resume text (simple keyword extraction)
export const extractSkills = (resumeText) => {
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'sql',
    'html', 'css', 'git', 'docker', 'kubernetes', 'aws', 'azure',
    'machine learning', 'artificial intelligence', 'data analysis',
    'project management', 'agile', 'scrum', 'leadership', 'communication'
  ];

  const text = resumeText.toLowerCase();
  const foundSkills = commonSkills.filter(skill => 
    text.includes(skill.toLowerCase())
  );

  return foundSkills;
};

// ---------------------------------------------
// ML-style similarity: TF-IDF cosine similarity
// ---------------------------------------------

const STOP_WORDS = new Set([
  'the','and','or','but','if','then','else','for','on','in','at','to','of','a','an','with','by','from','as','is','are','was','were','be','been','this','that','these','those','it','its','we','you','they','i','my','our','your','their'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOP_WORDS.has(t));
}

function termFrequency(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const total = tokens.length || 1;
  for (const [k, v] of tf) tf.set(k, v / total);
  return tf;
}

function buildTfidfVector(vocab, tf, idf) {
  const vec = new Array(vocab.length).fill(0);
  for (let i = 0; i < vocab.length; i++) {
    const term = vocab[i];
    const tfVal = tf.get(term) || 0;
    vec[i] = tfVal * (idf.get(term) || 0);
  }
  return vec;
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Calculate a 0-100 score using TF-IDF cosine similarity between resume and job description+keywords
export const calculateMatchScoreML = (resumeText, jobDescription, requiredKeywords = []) => {
  const aliasMap = new Map([
    ['js', 'javascript'],
    ['ts', 'typescript'],
    ['react.js', 'react'],
    ['reactjs', 'react'],
    ['node.js', 'node'],
    ['nodejs', 'node'],
    ['next.js', 'nextjs'],
    ['express.js', 'express'],
    ['mongo', 'mongodb']
  ]);

  function normalizeAndExpand(tokens) {
    const out = new Set();
    for (const raw of tokens) {
      let t = raw;
      // direct add
      out.add(t);
      // dot variants: react.js -> ['react', 'reactjs']
      if (t.includes('.')) {
        const parts = t.split('.').filter(Boolean);
        for (const p of parts) out.add(p);
        out.add(t.replaceAll('.', '')); // reactjs
      }
      // alias mapping
      const alias = aliasMap.get(t);
      if (alias) out.add(alias);
    }
    return Array.from(out);
  }

  const resumeTokens = normalizeAndExpand(tokenize(resumeText));
  const keywordTokensRaw = Array.isArray(requiredKeywords) ? requiredKeywords.map(k => String(k).toLowerCase()) : [];
  const jobTokens = normalizeAndExpand(tokenize(`${jobDescription || ''} ${keywordTokensRaw.join(' ')}`));

  if (resumeTokens.length === 0 && jobTokens.length === 0) return 0;

  const tfResume = termFrequency(resumeTokens);
  const tfJob = termFrequency(jobTokens);

  // Build vocabulary from both docs
  const vocabSet = new Set([...resumeTokens, ...jobTokens]);
  const vocab = Array.from(vocabSet);

  // IDF with N=2 docs
  const N = 2;
  const idf = new Map();
  for (const term of vocab) {
    const df = (tfResume.has(term) ? 1 : 0) + (tfJob.has(term) ? 1 : 0);
    // Avoid division by zero; add smoothing
    const val = Math.log((N + 1) / (df + 1)) + 1; // classic idf smoothing
    idf.set(term, val);
  }

  // Build vectors and compute cosine similarity
  const vResume = buildTfidfVector(vocab, tfResume, idf);
  const vJob = buildTfidfVector(vocab, tfJob, idf);

  const sim = cosineSimilarity(vResume, vJob);
  // Map similarity [0,1] to percentage
  return Math.round(sim * 100);
};