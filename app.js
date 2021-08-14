// 1. Hacker News 안의 모든 피드 가져오기
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
ajax.open("GET", NEWS_URL, false);
ajax.send();
const newsFeed = JSON.parse(ajax.response);
let data = {};

// 2. newsFeed 불러오기 (by using handlebars)
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

  // 2-1. individual_url 프로퍼티를 list 객체에 추가하기
  for (let i = 0; i < data.list.length; i++) {
    data.list[i].individual_url = `#/item?id=${newsFeed[i].id}`;
    //   data.list[i].individual_url = `https://api.hnpwa.com/v0/item/${newsFeed[i].id}/json`;
  }

  let template = Handlebars.compile(source);
  document.querySelector(".container").innerHTML = template(data);
}

// 3. 클릭한 글의 id를 전달해서 individual_contents 불러오기
function getIndividualContents(id) {
  const CONTENT_URL = `https://api.hnpwa.com/v0/item/${id}/json`;
  const source = `
  <div class="title">
    <h1>
      <a href="{{url}}">{{title}} ({{domain}})</a>
    </h1>
    <div>
      <span>{{points}} points by {{user}} {{time_ago}}</span>
      <span><a href="{{individual_url}}">{{comments_count}} comments</a></span>
    </div>
  </div>
  <ul>
    {{#each list}}
    <li>
      <div>{{user}} {{time_ago}}</div>
      <div>{{content}}</div>
    </li>
    {{/each}}
  </ul>
  `;

  // error: 왜 data = { content }; 는 되지 않을까?
  ajax.open("GET", CONTENT_URL, false);
  ajax.send();
  const content = JSON.parse(ajax.response);
  const comments = JSON.parse(ajax.response).comments;
  data = {
    // 이 부분은 좀 간단하게 줄이고 싶은데..
    title: content.title,
    url: content.url,
    domain: content.domain,
    points: content.points,
    user: content.user,
    time_ago: content.time_ago,
    list: comments,
  };

  console.log(content);
  let template = Handlebars.compile(source);
  document.querySelector(".container").innerHTML = template(data);
}

getIndividualContents(28180135);
