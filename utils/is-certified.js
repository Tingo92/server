// Util to check if a volunteer is certified
const isCertified = certifications => {
  let isCertified = false;

  for (const subject in certifications) {
    if (certifications[subject].passed) {
      isCertified = true;
      break;
    }
  }

  return isCertified;
};

module.exports = isCertified;
