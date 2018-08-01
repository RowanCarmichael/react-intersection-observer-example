import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      posts: [],
      lastPostId: null,
      prevY: 0,
    }
    this.loaderRef = React.createRef();
    this.rootRef = React.createRef();
  }

  isObserved = (entities) => {
    const y = entities[0].boundingClientRect.y;
    if (this.state.prevY > y) {
      this.getPosts(this.state.lastPostId);
    }
    this.setState({ prevY: y });
  }

  getPosts = (lastPostId) => {
    const extraParameters = lastPostId ? `&after=${lastPostId}` : '';
    fetch(`https://www.reddit.com/r/popular.json?limit=10${extraParameters}`).then((response) => {
      return response.json();
    }).then((json) => {
      this.setState((prevState) => ({
        posts: [...prevState.posts, ...json.data.children.map((post) => post.data)],
        lastPostId: json.data.children[json.data.children.length - 1].data.name,
      }))
    });
  }

  componentDidMount() {
    const options = {
      root: this.rootRef.current,
    }
    this.getPosts();
    const observer = new IntersectionObserver(this.isObserved, options);
    observer.observe(this.loaderRef.current);
  }

  render() {
    return (
      <div className="app" refs={this.rootRef}>
        <h1>Intersection Observer - Infinite Scrolling Reddit Example</h1>
        <div>
          {this.state.posts.map((post) => (
            <div key={post.name} className="post">
              <p className="score">{post.score}</p>
              {post.thumbnail.includes('http') && <img className="thumbnail" src={post.thumbnail} alt={post.thumbnail} />}
              {!post.thumbnail.includes('http') && <div className="blankThumbnail">[{post.thumbnail}]</div>}
              <div className="postDetails">
                <h2 className="inline">{post.title} </h2>
                <p className="inline"><i>({post.domain})</i></p>
                <p>{post.num_comments} comments</p>
                <p className="inline">Posted at {new Date(post.created*1000).toLocaleString()} </p>
                <p className="inline">by <i>{post.author}</i> </p>
                <p className="inline">to <i>{post.subreddit_name_prefixed}</i></p>
              </div>
            </div>
          ))}
        </div>
        <div ref={this.loaderRef}>
          <div className="loaderContainer">
            <h2 className="score">-</h2>
            <div className="blankThumbnail" />
            <div className="loader" />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
