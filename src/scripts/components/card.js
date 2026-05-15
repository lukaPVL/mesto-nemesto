export function isCardLiked(likeButton) {
  return likeButton.classList.contains('card__like-button_is-active');
}

export function updateLikeStatus(likeButton, likeCountElement, cardData, userId) {
  likeCountElement.textContent = cardData.likes.length;

  const isLiked = cardData.likes.some((user) => user._id === userId);

  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  } else {
    likeButton.classList.remove('card__like-button_is-active');
  }
}

export function createCard(cardData, userId, callbacks) {
  const cardTemplate = document.querySelector('#card-template').content;
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardTitle.textContent = cardData.name;
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;

  updateLikeStatus(likeButton, likeCount, cardData, userId);

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => callbacks.onDeleteClick(cardData._id, cardElement));
  }

  if (infoButton) {
    infoButton.addEventListener('click', () => callbacks.onInfoClick(cardData._id));
  }
  cardImage.addEventListener('click', () => callbacks.onImageClick(cardData));
  likeButton.addEventListener('click', () => callbacks.onLikeClick(cardData._id, likeButton, likeCount));

  return cardElement;
}

export function removeCardElement(cardElement) {
  cardElement.remove();
}
