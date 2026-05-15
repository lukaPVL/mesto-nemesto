import '../pages/index.css';
import {
  addNewCard,
  changeLikeCardStatus,
  deleteCard,
  getCardList,
  getInitialCards,
  getUserInfo,
  setUserAvatar,
  setUserInfo
} from './components/api.js';
import { openModal, closeModal, handleOverlayClose } from './components/modal.js';
import { createCard, updateLikeStatus, isCardLiked, removeCardElement } from './components/card.js';
import { enableValidation, clearValidation, showInputError } from './components/validation.js';

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');

const placesList = document.querySelector('.places__list');

const popups = document.querySelectorAll('.popup');
const popupEditProfile = document.querySelector('.popup_type_edit');
const popupNewCard = document.querySelector('.popup_type_new-card');
const popupEditAvatar = document.querySelector('.popup_type_edit-avatar');
const popupRemoveCard = document.querySelector('.popup_type_remove-card');
const popupImage = document.querySelector('.popup_type_image');
const popupInfo = document.querySelector('.popup_type_info');
const popupInfoTitle = popupInfo.querySelector('.popup__title');
const popupInfoDescriptionList = popupInfo.querySelector('.popup__info');
const popupInfoLikesTitle = popupInfo.querySelector('.popup__text');
const popupInfoLikesList = popupInfo.querySelector('.popup__list');

const profileForm = document.forms['edit-profile'];
const newCardForm = document.forms['new-place'];
const avatarForm = document.forms['edit-avatar'];
const removeCardForm = document.forms['remove-card'];

const profileNameInput = profileForm.elements.name;
const profileDescriptionInput = profileForm.elements.description;
const cardNameInput = newCardForm.elements['place-name'];
const cardLinkInput = newCardForm.elements.link;
const avatarInput = avatarForm.elements.avatar;


const popupInfoItemTemplate = document.querySelector('#popup-info-definition-template').content;

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

enableValidation(validationConfig);

profileEditButton.addEventListener('click', () => {
  clearValidation(popupEditProfile, validationConfig);
  profileNameInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModal(popupEditProfile);
});

const submitButtonText = {
  save: 'Сохранить',
  create: 'Создать',
  remove: 'Да',
  saving: 'Сохранение...',
  creating: 'Создание...',
  removing: 'Удаление...'
};

let currentUserId = '';
let cardToRemove = null;

function setButtonText(button, text) {
  button.textContent = text;
}

function renderProfile(userData) {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileImage.style.backgroundImage = `url(${userData.avatar})`;
}

function renderCard(cardData, container, renderMethod = 'append') {
  const cardElement = createCard(cardData, currentUserId, {
    onImageClick: handleImageClick,
    onDeleteClick: handleDeleteClick,
    onLikeClick: handleLikeClick,
    onInfoClick: handleInfoClick
  });

  container[renderMethod](cardElement);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function createInfoItem(label, value) {
  const infoItem = popupInfoItemTemplate.querySelector('.popup__info-item').cloneNode(true);
  const infoLabel = infoItem.querySelector('.popup__info-term'); 
  const infoValue = infoItem.querySelector('.popup__info-description');

  infoLabel.textContent = label;
  infoValue.textContent = value;

  return infoItem;
}

function renderCardInfo(cardData) {
  popupInfoTitle.textContent = 'Информация о карточке';
  popupInfoLikesTitle.textContent = 'Лайкнули:';

  const infoItems = [
    createInfoItem('Описание:', cardData.name),
    createInfoItem('Дата создания:', formatDate(cardData.createdAt)),
    createInfoItem('Владелец:', cardData.owner.name),
    createInfoItem('Количество лайков:', cardData.likes.length)
  ];
  popupInfoDescriptionList.replaceChildren(...infoItems);

  const likesItems = cardData.likes.map(user => {
    const li = document.createElement('li');
    li.classList.add('popup__item');
    li.textContent = user.name;
    return li;
  });

  if (likesItems.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет лайков';
    popupInfoLikesList.replaceChildren(li);
  } else {
    popupInfoLikesList.replaceChildren(...likesItems);
  }
}

function handleImageClick(cardData) {
  popupImageElement.src = cardData.link;
  popupImageElement.alt = cardData.name;
  popupCaption.textContent = cardData.name;

  openModal(popupImage);
}

function handleDeleteClick(cardId, cardElement) {
  cardToRemove = {
    id: cardId,
    element: cardElement
  };

  openModal(popupRemoveCard);
}

function handleLikeClick(cardId, likeButton, likeCountElement) {
  const currentlyLiked = isCardLiked(likeButton);

  changeLikeCardStatus(cardId, currentlyLiked)
    .then((updatedCard) => {
      updateLikeStatus(likeButton, likeCountElement, updatedCard, currentUserId);
    })
    .catch((err) => {
      console.error('Ошибка при изменении лайка:', err);
    });
}

function handleInfoClick(cardId) {
  popupInfoDescriptionList.replaceChildren(createInfoItem('Статус', 'Загрузка...'));
  popupInfoLikesList.replaceChildren();
  openModal(popupInfo);

  getCardList()
    .then((cards) => {
      const currentCard = cards.find((card) => card._id === cardId);

      if (!currentCard) {
        throw new Error('Карточка не найдена');
      }

      renderCardInfo(currentCard);
    })
    .catch((err) => {
      popupInfoList.replaceChildren(createInfoItem('Ошибка', 'Не удалось загрузить данные карточки'));
      console.error('Ошибка при загрузке информации о карточке:', err);
    });
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, submitButtonText.saving);

  setUserInfo(profileNameInput.value, profileDescriptionInput.value)
    .then((userData) => {
      renderProfile(userData);
      closeModal(popupEditProfile);
    })
    .catch((err) => {
      console.error('Ошибка при обновлении профиля:', err);
    })
    .finally(() => {
      setButtonText(submitButton, submitButtonText.save);
    });
}

function handleNewCardFormSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  setButtonText(submitButton, submitButtonText.creating);

  addNewCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      renderCard(cardData, placesList, 'prepend');
      newCardForm.reset();
      closeModal(popupNewCard);
    })
    .catch((err) => {
      console.error('Ошибка при создании карточки:', err);
    })
    .finally(() => {
      setButtonText(submitButton, submitButtonText.create);
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  
  const submitButton = evt.submitter;
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      renderProfile(userData);
      avatarForm.reset(); 
      closeModal(popupEditAvatar); 
    })
    .catch((err) => {
      console.error(err);
      
      showInputError(
        avatarForm, 
        avatarInput, 
        'Сервер не нашел картинку по этой ссылке (404)', 
        validationConfig
      );
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
    });
}

function handleRemoveCardFormSubmit(evt) {
  evt.preventDefault();

  if (!cardToRemove) {
    return;
  }

  const submitButton = evt.submitter;
  setButtonText(submitButton, submitButtonText.removing);

  deleteCard(cardToRemove.id)
    .then(() => {
      removeCardElement(cardToRemove.element);
      cardToRemove = null;
      closeModal(popupRemoveCard);
    })
    .catch((err) => {
      console.error('Ошибка при удалении карточки:', err);
    })
    .finally(() => {
      setButtonText(submitButton, submitButtonText.remove);
    });
}

popups.forEach((popup) => {
  const closeButton = popup.querySelector('.popup__close');

  closeButton.addEventListener('click', () => closeModal(popup));
  popup.addEventListener('mousedown', handleOverlayClose);
});

profileAddButton.addEventListener('click', () => {
  newCardForm.reset();
  clearValidation(popupNewCard, validationConfig);
  openModal(popupNewCard);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  openModal(popupEditAvatar);
});

profileForm.addEventListener('submit', handleProfileFormSubmit);
newCardForm.addEventListener('submit', handleNewCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
removeCardForm.addEventListener('submit', handleRemoveCardFormSubmit);

Promise.all([getUserInfo(), getInitialCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    renderProfile(userData);
    cards.forEach((cardData) => renderCard(cardData, placesList));
  })
  .catch((err) => {
    console.error('Ошибка при загрузке начальных данных:', err);
  });
