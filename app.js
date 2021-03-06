// Hacker News 피드 정보 가져오기
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const container = document.querySelector(".container");
const header = document.querySelector("header");
const postsPerPage = 5; // 1페이지 당 게시물 수
let store = {};
let currentPage = 1;

function getData(url) {
  ajax.open("GET", url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}

// newsFeed 불러오기
function getNewsFeed() {
  const newsFeed = getData(NEWS_URL);
  const lastPage = newsFeed.length % postsPerPage === 0 ? parseInt(newsFeed.length / postsPerPage) : parseInt(newsFeed.length / postsPerPage) + 1;

  const source = `
    <ul>
      {{#each list}}
      <li>
        <h3><a href="{{url}}">{{title}} ({{domain}})</a></h3>
        <div>
          <span>{{points}} points by {{user}} {{time_ago}}</span>
          <a href="{{individual_url}}"><div id="comments"><i class="far fa-comment"></i>{{comments_count}} comments</div></a>
        </div>
      </li>
      {{/each}}
    </ul> 
    <div class="page">
        <a href="#news?p={{prev_page}}"><span>Prev</span></a>
        <a href="#news?p={{next_page}}"><span>Next</span></a>
    </div>
    `;

  store = {
    list: newsFeed.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage),
    // 이전 페이지, 다음 페이지 구현(삼항 조건 연산자 사용)
    prev_page: currentPage > 1 ? currentPage - 1 : currentPage,
    next_page: currentPage < lastPage ? currentPage + 1 : lastPage,
  };

  for (let i = 0; i < store.list.length; i++) {
    store.list[i].individual_url = `#item?id=${store.list[i].id}`;
  }

  let template = Handlebars.compile(source);
  container.innerHTML = template(store);
  header.innerHTML = `
  <h1>
    <a href=""><i class="fab fa-hacker-news-square"></i>Hacker News</a>
  </h1>`;
}

// 클릭한 글의 id를 전달해서 콘텐츠 화면 불러오기
function getIndividualContents(id) {
  const CONTENT_URL = `https://api.hnpwa.com/v0/item/${id}/json`;
  const contents = getData(CONTENT_URL);
  const source = `
  <div class="title">
    <h1>
      <a href="{{url}}">{{title}} ({{domain}})</a>
    </h1>
    <div>
    <span>{{points}} points by {{user}} {{time_ago}}</span>
    <div id="comments"><i class="far fa-comment"></i>{{comments_count}} comments</div>
    </div>
  </div>

  <ul id="comments-list">
  </ul>
  `;

  store = {
    title: contents.title,
    url: contents.url,
    domain: contents.domain,
    points: contents.points,
    user: contents.user,
    time_ago: contents.time_ago,
    comments_count: contents.comments_count,
  };

  const template = Handlebars.compile(source);
  container.innerHTML = template(store);

  // comments의 html을 ul의 innerHTML으로 넣기
  function makeComments(comments, called = 0) {
    const commentString = [];
    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <li>
          <div id="comment-info" style = "padding-left: ${called * 1.5}rem"}><i class="far fa-comment-alt"></i>${comments[i].user} ${comments[i].time_ago}</div>
          <div style = "padding-left: ${called * 1.5}rem">${comments[i].content}</div>
        </li> 
    `);
      if (comments[i].comments_count > 0) {
        commentString.push(makeComments(comments[i].comments, called + 1));
      }
    }
    return commentString.join("");
  }

  document.querySelector(".container ul").innerHTML = makeComments(contents.comments);
  header.innerHTML = `
    <h1>
      <a href=""><i class="fab fa-hacker-news-square"></i>Hacker News</a>
    </h1>
    <div title="뒤로가기">
      <a href="#"><i class="fas fa-arrow-circle-left"></i></a>
    </div>
  `;
}

// 라우터 구현
function router() {
  const hash = location.hash;
  if (hash === "") {
    getNewsFeed();
  } else if (hash.substr(1, 7) === "news?p=") {
    // currentPage 갱신
    currentPage = Number(hash.substr(8));
    getNewsFeed();
  } else {
    getIndividualContents(hash.substr(9, location.hash.length));
  }
}
window.addEventListener("hashchange", router);
router();
