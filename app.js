// Hacker News 피드 정보 가져오기
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const newsFeed = getData(NEWS_URL);
let data = {};

// 데이터 가져오기
function getData(url) {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// newsFeed 불러오기
function getNewsFeed() {
  const source = `
    <ul>
      {{#each list}}
      <li>
        <div><a href="{{url}}">{{title}} ({{domain}})</a></div>
        <div>
          <span>{{points}} points by {{user}} {{time_ago}}</span>
          <span><a href="{{individual_url}}">{{comments_count}} comments</a></span>
        </div>
      </li>
      {{/each}}
    </ul>
    `;

  data = {
    list: newsFeed,
  };

  for (let i = 0; i < data.list.length; i++) {
    data.list[i].individual_url = `#${newsFeed[i].id}`;
  }

  let template = Handlebars.compile(source);
  document.querySelector(".container").innerHTML = template(data);
}

// 클릭한 글의 id를 전달해서 콘텐츠 화면 불러오기
function getIndividualContents(id) {
  const CONTENT_URL = `https://api.hnpwa.com/v0/item/${id}/json`;
  const source = `
  <div class="title">
    <h1>
      <a href="{{url}}">{{title}} ({{domain}})</a>
    </h1>
    <div>
      <span>{{points}} points</span>
      <span>by {{user}}</span>
      <span>{{time_ago}}</span>
      <span>{{comments_count}} comments</span>
    </div>
  </div>

  <ul>
  </ul>
  `;

  const contents = getData(CONTENT_URL);

  data = {
    title: contents.title,
    url: contents.url,
    domain: contents.domain,
    points: contents.points,
    user: contents.user,
    time_ago: contents.time_ago,
    comments_count: contents.comments_count,
  };

  let template = Handlebars.compile(source);
  document.querySelector(".container").innerHTML = template(data);

  // comments에 대댓글 template 넣기
  function makeComments(comments, called = 0) {
    const commentString = [];
    // 대댓글에는 ${called}rem 만큼 padding-left
    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <li>
          <div style = "padding-left: ${called * 2.5}rem"}>${comments[i].user} ${comments[i].time_ago}</div>
          <div style = "padding-left: ${called * 2.5}rem">${comments[i].content}</div>
        </li> 
    `);

      if (comments[i].comments_count > 0) {
        commentString.push(makeComments(comments[i].comments, called + 1));
      }
    }
    return commentString.join("");
  }

  comment_list = makeComments(contents.comments);
  document.querySelector(".container ul").innerHTML = comment_list;
}

// 라우터 구현
function router() {
  const hash = location.hash.substr(1, location.hash.length);
  if (hash === "") {
    getNewsFeed();
  } else {
    getIndividualContents(hash);
  }
}

window.addEventListener("hashchange", router);
router();
