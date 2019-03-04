const getContactHref = (name, contact) => {
  let href;

  switch (name) {
    case 'twitter':
      href = `https://www.twitter.com/${contact}`;
      break;
    case 'github':
      href = `https://github.com/${contact}`;
      break;
      case 'linkedin':
      href = `https://linkedin.com/in/${contact}`;
      break;
    default:
      href = contact;
      break;
  }

  return href;
};

export default getContactHref;
