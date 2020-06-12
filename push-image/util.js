function getImageDigest(inspect) {
  const [{ RepoDigests: repoDigests }] = inspect;
  const [repository, digest] = repoDigests[0].split('@');
  return digest;
}

module.exports = {
  getImageDigest,
}
