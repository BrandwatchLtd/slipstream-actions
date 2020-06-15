function getImageDigest(inspect) {
  const [{ RepoDigests: repoDigests }] = inspect;
  const [, digest] = repoDigests[0].split('@');
  return digest;
}

module.exports = {
  getImageDigest,
};
