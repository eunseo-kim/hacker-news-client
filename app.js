// 1. Hacker News 피드 정보 가져오기
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
ajax.open("GET", NEWS_URL, false);
ajax.send();
const newsFeed = JSON.parse(ajax.response);

let data = {};

// 2. newsFeed 불러오기
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

// 3. 클릭한 글의 id를 전달해서 콘텐츠 화면 불러오기
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
    title: content.title,
    url: content.url,
    domain: content.domain,
    points: content.points,
    user: content.user,
    time_ago: content.time_ago,
    individual_url: `#${id}`,
    id: content.id,
    list: comments,
  };

  let template = Handlebars.compile(source);
  document.querySelector(".container").innerHTML = template(data);
}

// 4. 라우터 구현하기
// 어떤 정보를 기준으로 뉴스피드인지, 게시물 정보인지 확인할 수 있나? => url(#) 뒤에 오는 id의 유무!
function router() {
  // ✅error 해결 : Hash 방식으로 라우터 구현
  const hash = location.hash.substr(1, location.hash.length);
  if (hash === "") {
    getNewsFeed();
  } else {
    getIndividualContents(hash);
  }
}

window.addEventListener("hashchange", router);
// error2. 뉴스피드 => 콘텐츠 화면 => title 링크 => 뒤로가기
// 하면? 왜 뉴스피드로 되돌아올까? 콘텐츠 화면이 나와야 되는데...
// ✅바보같이 아랫줄에 router() 대신 getNewsFeed()를 실행했다.
// 외부 링크에서 다시 올때는 브라우저가 새로 로딩되는 것이다. 즉, router()이 실행된다.
// 항상 첫화면(news Feed)이 출력된다는 보장은 없다!
router();
