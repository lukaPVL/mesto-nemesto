const config = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-203',
  headers: {
    authorization: 'e11ae246-797f-4a27-afe1-40ed00ddf5bf',
    'Content-Type': 'application/json'
  }
};

const getResponseData = (res) => {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
};

function request(endpoint, options) {
  return fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: config.headers
  }).then(getResponseData);
}

export const getUserInfo = () => {
  return request('/users/me', {});
};

export const getInitialCards = () => {
  return request('/cards', {});
};

export const getCardList = getInitialCards;

export const editProfile = (name, about) => {
  return request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name, about })
  });
};

export const setUserInfo = editProfile;

export const setUserAvatar = (avatar) => {
  return request('/users/me/avatar', {
    method: 'PATCH',
    body: JSON.stringify({ avatar })
  });
};

export const addNewCard = (name, link) => {
  return request('/cards', {
    method: 'POST',
    body: JSON.stringify({ name, link })
  });
};

export const deleteCard = (cardId) => {
  return request(`/cards/${cardId}`, {
    method: 'DELETE'
  });
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return request(`/cards/likes/${cardId}`, {
    method: isLiked ? 'DELETE' : 'PUT'
  });
};
