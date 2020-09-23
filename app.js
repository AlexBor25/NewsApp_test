// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = 'cc4867de564142ecac8225834981f4b6';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ru', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
} ());

const form = document.forms['newsControls'],
      countrySelect = form.elements['country'],
      searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;

  if(!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

function onGetResponse(err, res) {
  removeLoader();
  
  if(err) {
    showAlert(err, 'error-msg');
    return;
  }

  if(!res.articles.length) {
    //сделать показ сообщения если не придет новость!!
    return;
  }
  renderNews(res.articles);
}

function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if(newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment +=el;
  });
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function newsTemplate({urlToImage, title, url, description}) {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage}">
        <span class="card-title">${title || 'Новость'}</span>
      </div>
      <div class="card-content">
        <p>${description || 'Новостей нет'}</p>
      </div>
      <div class="card-action">
        <a href="${url}">Читать далее</a>
      </div>
    </div>
  </div>
  `
}

function showAlert(msg, type = 'success') {
  M.toast({html:msg, classes: type });
}

function clearContainer(container) {
  let child = container.lastElementChild;
  while(child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', 
  `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `);
}

function removeLoader() {
  const loader = document.querySelector('.progress');
  if(loader) {
    loader.remove();
  }
}