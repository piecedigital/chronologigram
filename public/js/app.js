"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var CC = _react2["default"].createClass;

var client_id = "430e8e6b069649cc9ab0bdb76647f0f4";

var func = function func() {
  console.log("JSONP CB");
};
// ajax function
var ajax = function ajax(optionsObj) {
  //console.log(optionsObj)
  optionsObj = optionsObj || {};

  var httpRequest = new XMLHttpRequest();
  httpRequest.withCredentials = true;
  httpRequest.onreadystatechange = function (data) {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status < 400) {
        optionsObj.success(data.target.response);
      } else {
        optionsObj.error({
          "status": data.target.status,
          "message": data.target.responseText,
          "response": data.target
        });
      }
    }
  };
  var contentTypes = {
    "*": "*/*",
    json: "application/json, text/javascript",
    xml: "application/xml, text/xml",
    jsonp: "application/javascript",
    text: "text/plain",
    html: "text/html"
  };

  httpRequest.open((optionsObj.type || "GET").toUpperCase(), optionsObj.url);
  httpRequest.setRequestHeader("Accept", "" + contentTypes[optionsObj.dataType || "*"]);
  // httpRequest.setRequestHeader("Content-Type", `application/x-www-form-urlencoded; charset=UTF-8`);
  httpRequest.send(optionsObj.data || null);
};
// button used to authorize the user
var AuthUser = CC({
  displayName: "AuthUser",
  getInitialState: function getInitialState() {
    return {
      loggedIn: false,
      cookies: this.gatherCookies(true)
    };
  },
  authUser: function authUser() {
    window.open("https://api.instagram.com/oauth/authorize/?client_id=" + client_id + "&redirect_uri=http://localhost:8080/&response_type=token&scope=basic+likes+comments+public_content");
  },
  unauthUser: function unauthUser() {
    document.cookie = "access_token=;expires=" + new Date().toUTCString();
    this.setState({
      loggedIn: false
    });
    this.props.parent.setState({
      loggedIn: false
    });
  },
  makeHashQuery: function makeHashQuery() {
    var hashQueryObject = {};
    location.hash.replace(/(\#|\&)(([\d\w\_]+)=([\d\w\.]+))/gi, function (_, __, ___, key, value) {
      hashQueryObject[key] = value;
    });
    return hashQueryObject;
  },
  gatherCookies: function gatherCookies(dontSet) {
    var cookies = {};
    document.cookie.replace(/(;\s)?(([\d\w]+)=([\d\w\.]+))/gi, function (_, __, ___, key, value) {
      cookies[key] = value;
    });
    if (!dontSet) this.setState({
      cookies: cookies
    });
    return cookies;
  },
  getCookie: function getCookie(query) {
    var cookies = this.state.cookies;

    return cookies ? cookies[query] : this.gatherCookies()[query];
  },
  componentDidMount: function componentDidMount() {
    var token = this.getCookie("access_token");
    if (token) {
      location.hash = "";
      console.log("access_token cookie found");
      this.setState({
        loggedIn: true,
        access_token: token
      });
      this.props.parent.setState({
        loggedIn: true,
        access_token: token
      });
    } else if (location.hash) {
      console.log("hash found");
      var query = this.makeHashQuery();
      if (query["access_token"]) {
        location.hash = "";
        console.log("access_token hash query found");
        document.cookie = "access_token=" + query["access_token"] + ";";
        this.setState({
          loggedIn: true,
          access_token: query["access_token"],
          cookies: Object.assign(this.state.cookies, { access_token: query["access_token"] })
        });
        this.props.parent.setState({
          loggedIn: true,
          access_token: query["access_token"]
        });
      };
    };
  },
  render: function render() {
    return !this.state.loggedIn ? _react2["default"].createElement(
      "button",
      { onClick: this.authUser },
      "Login via Instagram"
    ) : _react2["default"].createElement(
      "button",
      { onClick: this.unauthUser },
      "Logout"
    );
  }
});

// FeedItem comments
var ItemComments = CC({
  displayName: "ItemComments",
  componentDidMount: function componentDidMount() {
    // console.log(this.props)
    ajax({
      url: "/v1/media/" + this.props.mediaID + "/comments/?access_token=" + this.props.access_token,
      dataType: "json",
      success: (function (data) {
        data = JSON.parse(data);
        data = JSON.parse(data);
        console.log(data);
        return;
        // this.setState({
        // });
      }).bind(this),
      error: function error(data) {
        console.error(new Error(data.message).stack, data);
      }
    });
  },
  render: function render() {
    return _react2["default"].createElement(
      "div",
      null,
      "I'm a damn comment"
    );
  }
});
// UserFeed item
var FeedItem = CC({
  displayName: "FeedItem",
  getInitialState: function getInitialState() {
    // console.log(this.props.postData)
    var _props$postData = this.props.postData;
    var date = _props$postData.created_time;
    var id = _props$postData.id;
    var type = _props$postData.type;
    var caption = _props$postData.caption;
    var link = _props$postData.link;
    var user = _props$postData.user;
    var commentsCount = _props$postData.comments.count;
    var likesCount = _props$postData.likes.count;

    var imageSD, videoSD;
    if (type === "image") {
      var imageSD = this.props.postData.images.standard_resolution.url;
    } else {
      var videoSD = this.props.postData.videos.standard_resolution.url;
    };
    // console.log(type, imageSD, videoSD);
    return {
      date: date,
      id: id,
      type: type,
      caption: caption,
      link: link,
      user: user,
      commentsCount: commentsCount,
      likesCount: likesCount,
      imageSD: imageSD,
      videoSD: videoSD
    };
  },
  playPause: function playPause() {
    if (this.paused) {
      this.play();
    } else if (this.ended) {
      this.currentTime = 0;
      this.play();
    };
  },
  goToProfile: function goToProfile() {
    console.log("This function will open user profile", this.state.user.username);
  },
  render: function render() {
    var _state = this.state;
    var date = _state.date;
    var id = _state.id;
    var type = _state.type;
    var caption = _state.caption;
    var likesCount = _state.likesCount;
    var commentsCount = _state.commentsCount;
    var link = _state.link;
    var user = _state.user;
    var imageSD = _state.imageSD;
    var videoSD = _state.videoSD;

    // console.log(this.state);
    return _react2["default"].createElement(
      "li",
      { "data-post-id": id },
      _react2["default"].createElement(
        "div",
        { className: "user-head", onClick: this.goToProfile },
        _react2["default"].createElement(
          "div",
          { className: "user" },
          _react2["default"].createElement("img", { src: user.profile_picture }),
          _react2["default"].createElement(
            "a",
            { href: "http://instagram.com/" + user.username },
            user.username
          )
        ),
        _react2["default"].createElement(
          "div",
          { className: "date" },
          _react2["default"].createElement(
            "a",
            { href: link },
            _react2["default"].createElement(
              "span",
              null,
              new Date(parseInt(date * 1000)).toGMTString()
            )
          )
        )
      ),
      _react2["default"].createElement(
        "div",
        { className: "post-image" },
        type === "image" ? _react2["default"].createElement("img", { src: imageSD }) : _react2["default"].createElement("video", { src: videoSD, onClick: this.playPause })
      ),
      _react2["default"].createElement(
        "div",
        { className: "post-info" },
        _react2["default"].createElement(
          "div",
          { className: "activity" },
          _react2["default"].createElement(
            "a",
            { href: "#" },
            likesCount,
            " likes"
          ),
          ", ",
          _react2["default"].createElement(
            "a",
            { href: "#" },
            commentsCount,
            " comments"
          )
        )
      ),
      _react2["default"].createElement(
        "div",
        { className: "post-caption" + (caption ? "" : " faded") },
        caption ? caption.text : "No caption"
      )
    );
  }
});
// the user's timeline
var UserFeed = CC({
  displayName: "userFeed",
  getInitialState: function getInitialState() {
    return {
      timeline: []
    };
  },
  parsePaginationURL: function parsePaginationURL(URL) {
    return URL.replace("https://api.instagram.com/", "");
  },
  getMoreItems: function getMoreItems() {
    var maxID = this.state.timeline.length > 0 ? this.state.timeline[this.state.timeline.length - 1].id : "";
    console.log(maxID);
    ajax({
      url: "/v1/users/self/media/recent/?access_token=" + this.props.access_token + "&count=20&max_id=" + maxID,
      dataType: "json",
      success: (function (data) {
        data = JSON.parse(data);
        data = JSON.parse(data);
        console.log("success");
        // console.log(data);
        this.setState({
          timeline: Array.concat(this.state.timeline, data.data),
          nextPage: data.pagination.next_url
        });
      }).bind(this),
      error: function error(data) {
        console.error(new Error(data.message).stack, data);
      }
    });
  },
  componentDidMount: function componentDidMount() {
    this.getMoreItems();
  },
  render: function render() {
    var _this = this;

    return _react2["default"].createElement(
      "div",
      { className: "timeline" },
      _react2["default"].createElement(
        "div",
        { className: "posts" },
        this.state.timeline.map(function (postData, ind) {
          return _react2["default"].createElement(FeedItem, { key: ind, postData: postData, access_token: _this.props.access_token });
        })
      ),
      _react2["default"].createElement(
        "div",
        { className: "next-button" },
        _react2["default"].createElement(
          "button",
          { onClick: this.getMoreItems },
          "Load More"
        )
      )
    );
  }
});

// Parent component
var Parent = CC({
  displayName: "Parent",
  getInitialState: function getInitialState() {
    return {
      loggedIn: false,
      access_token: ""
    };
  },
  componentDidMount: function componentDidMount() {},
  render: function render() {
    return _react2["default"].createElement(
      "div",
      { className: "main-parent" },
      _react2["default"].createElement(AuthUser, { parent: this }),
      this.state.loggedIn ? _react2["default"].createElement(UserFeed, { access_token: this.state.access_token }) : "You need to authorize the app to view your timeline"
    );
  }
});
//{this.props.parent.state.loggedIn ? "We're logged in and ready to go!" : "We ain't ready, fam"}
_reactDom2["default"].render(_react2["default"].createElement(Parent, null), document.querySelector(".react"));
/*{ commentsCount > 0 ? <ItemComments mediaID={id} access_token={this.props.access_token}/> : "No comments" }*/