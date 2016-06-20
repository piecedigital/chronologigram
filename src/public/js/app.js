import React from "react";
import reactDom from "react-dom";
const {
  createClass: CC
} = React;
const client_id = "430e8e6b069649cc9ab0bdb76647f0f4";

var func=function() {
  console.log("JSONP CB")
};
// ajax function
var ajax = function(optionsObj) {
  //console.log(optionsObj)
  optionsObj = optionsObj || {};

  var httpRequest = new XMLHttpRequest();
  httpRequest.withCredentials = true;
  httpRequest.onreadystatechange = function(data) {
    if(httpRequest.readyState === 4) {
      if(httpRequest.status < 400) {
        optionsObj.success(data.target.response);
      } else {
        optionsObj.error({
          "status": data.target.status,
          "message": data.target.responseText,
          "response": data.target
        });
      }
    }
  }
  var contentTypes = {
    "*": "*/*",
    json: "application/json, text/javascript",
    xml: "application/xml, text/xml",
    jsonp: "application/javascript",
    text: "text/plain",
    html: "text/html"
  }

  httpRequest.open((optionsObj.type || "GET").toUpperCase(), optionsObj.url);
  httpRequest.setRequestHeader("Accept", `${contentTypes[(optionsObj.dataType || "*")]}`);
  // httpRequest.setRequestHeader("Content-Type", `application/x-www-form-urlencoded; charset=UTF-8`);
  httpRequest.send((optionsObj.data || null));
};
// button used to authorize the user
var AuthUser = CC({
  displayName: "AuthUser",
  getInitialState() {
    return {
      loggedIn: false,
      cookies: this.gatherCookies(true)
    };
  },
  authUser() {
    window.open(`https://api.instagram.com/oauth/authorize/?client_id=${client_id}&redirect_uri=http://localhost:8080/&response_type=token&scope=basic+likes+comments+public_content`);
  },
  unauthUser() {
    document.cookie = `access_token=;expires=${new Date().toUTCString()}`;
    this.setState({
      loggedIn: false
    });
    this.props.parent.setState({
      loggedIn: false
    });
  },
  makeHashQuery() {
    var hashQueryObject = {};
    location.hash.replace(/(\#|\&)(([\d\w\_]+)=([\d\w\.]+))/gi, function(_, __, ___, key, value) {
      hashQueryObject[key] = value;
    });
    return hashQueryObject;
  },
  gatherCookies(dontSet) {
    var cookies = {};
    document.cookie.replace(/(;\s)?(([\d\w]+)=([\d\w\.]+))/gi, function(_, __, ___, key, value) {
      cookies[key] = value;
    });
    if(!dontSet) this.setState({
      cookies
    });
    return cookies;
  },
  getCookie(query) {
    var { cookies } = this.state;
    return cookies ? cookies[query] : this.gatherCookies()[query];
  },
  componentDidMount() {
    var token = this.getCookie("access_token");
    if(token) {
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
    } else
    if(location.hash) {
      console.log("hash found");
      var query = this.makeHashQuery();
      if(query["access_token"]) {
        location.hash = "";
        console.log("access_token hash query found");
        document.cookie = `access_token=${query["access_token"]};`;
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
  render() {
    return !this.state.loggedIn ? (
      <button onClick={this.authUser}>Login via Instagram</button>
    ) : <button onClick={this.unauthUser}>Logout</button>;
  }
});

// FeedItem comments
var ItemComments = CC({
  displayName: "ItemComments",
  componentDidMount() {
    // console.log(this.props)
    ajax({
      url: `/v1/media/${this.props.mediaID}/comments/?access_token=${this.props.access_token}`,
      dataType: "json",
      success: function(data) {
        data = JSON.parse(data);
        data = JSON.parse(data);
        console.log(data);
        return;
        // this.setState({
        // });
      }.bind(this),
      error(data) {
        console.error(new Error(data.message).stack, data);
      }
    });
  },
  render() {
    return (
      <div>{`I'm a damn comment`}</div>
    )
  }
});
// UserFeed item
var FeedItem = CC({
  displayName: "FeedItem",
  getInitialState() {
    // console.log(this.props.postData)
    const {
      created_time: date,
      id,
      type,
      caption,
      link,
      user,
      comments: {
        count: commentsCount
      },
      likes: {
        count: likesCount
      }
    } = this.props.postData;
    var imageSD, videoSD;
    if(type === "image") {
      var {
        images: {
          standard_resolution: {
            url: imageSD
          }
        }
      } = this.props.postData;
    } else {
      var {
        videos: {
          standard_resolution: {
            url: videoSD
          }
        }
      } = this.props.postData;
    };
    // console.log(type, imageSD, videoSD);
    return {
      date,
      id,
      type,
      caption,
      link,
      user,
      commentsCount,
      likesCount,
      imageSD,
      videoSD
    };
  },
  playPause() {
    if(this.paused) {
      this.play()
    } else
    if(this.ended) {
      this.currentTime = 0;
      this.play();
    };
  },
  goToProfile() {
    console.log("This function will open user profile", this.state.user.username);
  },
  render() {
    const {
      date,
      id,
      type,
      caption,
      likesCount,
      commentsCount,
      link,
      user,
      imageSD,
      videoSD
    } = this.state;
    // console.log(this.state);
    return (
      <li data-post-id={id}>
        <div className={`user-head`} onClick={this.goToProfile}>
          <div className={`user`}>
            <img src={user.profile_picture}/><a href={`http://instagram.com/${user.username}`}>{user.username}</a>
          </div>
          <div className={`date`}>
            <a href={link}><span>{new Date(parseInt(date * 1000)).toGMTString()}</span></a>
          </div>
        </div>
        <div className={`post-image`}>
          { type === "image" ? <img src={imageSD}/> : <video src={videoSD} onClick={this.playPause}/> }
        </div>
        <div className={`post-info`}>
          <div className={`activity`}>
            <a href="#">{likesCount} likes</a>{`, `}
            <a href="#">{commentsCount} comments</a>
          </div>
        </div>
        <div className={`post-caption${caption ? "" : " faded"}`}>
          {caption ? caption.text : "No caption"}
        </div>
        {/*{ commentsCount > 0 ? <ItemComments mediaID={id} access_token={this.props.access_token}/> : "No comments" }*/}
      </li>
    );
  }
});
// the user's timeline
var UserFeed = CC({
  displayName: "userFeed",
  getInitialState() {
    return {
      timeline: []
    }
  },
  parsePaginationURL(URL) {
    return URL.replace("https://api.instagram.com/", "");
  },
  getMoreItems() {
    var maxID = this.state.timeline.length > 0 ? this.state.timeline[this.state.timeline.length-1].id : "";
    console.log(maxID);
    ajax({
      url: `/v1/users/self/media/recent/?access_token=${this.props.access_token}&count=20&max_id=${maxID}`,
      dataType: "json",
      success: function(data) {
        data = JSON.parse(data);
        data = JSON.parse(data);
        console.log("success");
        // console.log(data);
        this.setState({
          timeline: Array.concat(this.state.timeline, data.data),
          nextPage: data.pagination.next_url
        });
      }.bind(this),
      error(data) {
        console.error(new Error(data.message).stack, data);
      }
    });
  },
  componentDidMount() {
    this.getMoreItems();
  },
  render() {
    return (
      <div className={`timeline`}>
        <div className={`posts`}>
          { this.state.timeline.map((postData, ind) => <FeedItem key={ind} postData={postData} access_token={this.props.access_token} />) }
        </div>
        <div className={`next-button`}>
          <button onClick={this.getMoreItems}>Load More</button>
        </div>
      </div>
    );
  }
});

// Parent component
var Parent = CC({
  displayName: "Parent",
  getInitialState() {
    return {
      loggedIn: false,
      access_token: ""
    }
  },
  componentDidMount() {
  },
  render() {
    return (
      <div className="main-parent">
        <AuthUser parent={this}/>
        { this.state.loggedIn ? <UserFeed access_token={this.state.access_token} /> : "You need to authorize the app to view your timeline" }
      </div>
    )
  }
})
//{this.props.parent.state.loggedIn ? "We're logged in and ready to go!" : "We ain't ready, fam"}
reactDom.render(<Parent />, document.querySelector(".react"));
