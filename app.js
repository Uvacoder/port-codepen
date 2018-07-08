const worksContainer = document.getElementById('works-container')
const workContainers = document.querySelectorAll('[data-work-container]')

function fixWorksContainerHeight(container) {
  worksContainer.style.cssText += `; height: 0px;`
  requestAnimationFrame(() => {
    const minHeight = container.scrollHeight
    worksContainer.style.cssText += `; height: ${minHeight}px;`
  })
}

fixWorksContainerHeight(workContainers[0])

let windowWidth = window.innerWidth
window.addEventListener('resize', event => {
  if (windowWidth !== window.innerWidth) {
    requestAnimationFrame(() => {
      windowWidth = window.innerWidth
      const container = document.querySelector('.work-container--active')
      fixWorksContainerHeight(container)
    })
  }
})


const worksButtons = document.querySelectorAll('[data-works-button]')
worksButtons.forEach(button => {
  const container = Array.from(workContainers).find(container => {
    return container.dataset.workContainer === button.dataset.worksButton
  })
  button.addEventListener('click', e => {
    worksButtons.forEach(btn => btn.classList.remove('works-button--active'))
    workContainers.forEach(con => con.classList.remove('work-container--active'))
    button.classList.add('works-button--active')
    container.classList.add('work-container--active')
    fixWorksContainerHeight(container)
  })
})


const changeWorkButtons = document.querySelectorAll('[data-change-work-button]')
const works = document.querySelectorAll('[data-work]')
const codePenContainer = document.querySelector('[data-work-container="codepen"]')
changeWorkButtons.forEach(button => {
  button.addEventListener('click', e => {
    const activeWork = document.querySelector('.work--active')
    works.forEach(work => {
      work.classList.remove('work--active')
    })
    const activeIndex = Array.from(works).indexOf(activeWork)
    const isNext = button.dataset.changeWorkButton === 'next'
    const newActiveWork = works[activeIndex + (isNext ? 1 : -1)]
    newActiveWork.classList.add('work--active')
    const newActiveIndex = Array.from(works).indexOf(newActiveWork)
    const hasPrev = works[newActiveIndex - 1]
    const hasNext = works[newActiveIndex + 1]
    codePenContainer.classList.toggle('has-prev', hasPrev)
    codePenContainer.classList.toggle('has-next', hasNext)
    changeWorkButtons.forEach(btn => {
      const isNextBtn = btn.dataset.changeWorkButton === 'next'
      btn.disabled = (isNextBtn && !hasNext) || (!isNextBtn && !hasPrev)
    })
  })
})


function fetchPostsFromTumblr(limit = 3) {
  return fetch(`https://api.tumblr.com/v2/blog/x0r.tumblr.com/posts?limit=${limit}&tag=show_on_homepage&api_key=rPSt5BHEMqYFbAR6UVccYzEiLXWw6CSE92RTWbz9QOUim6W7TQ`)
}

function PostModel(post) {
  return {
    type: post.type,
    href: post.post_url,
    title: post.type === 'photo'
      ? toDOM(post.caption).innerText
      : post.title,
    content: post.type === 'photo'
      ? post.photos[0].original_size.url
      : post.summary
  }
}

function toDOM(html) {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

function blogPostTemplate(post) {
  return `
    <section class="blog-post-container">
      <div class="blog-post blog-post--${post.type}">
        <h3  class="blog-post__title">
          <a href="${post.href}">${post.title}</a>
        </h3>
        <div class="blog-post__content">
          ${
            post.type === 'photo'
              ? `<a href="${post.href}"><img src="${post.content}" /></a>`
              : post.content
          }
        </div>
      </div>
    </section>
  `
}

function blogPostsTemplate(posts) {
  return posts.reduce((html, post) => html + blogPostTemplate(post), '')
}

function renderBlogPosts() {
  const el = document.getElementById('blog-posts-container')
  fetchPostsFromTumblr()
    .then(res => res.json())
    .then(data => {
      el.innerHTML = blogPostsTemplate(data.response.posts.map(post => PostModel(post)))
    })
}

renderBlogPosts()
