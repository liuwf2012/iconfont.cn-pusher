// ==UserScript==
// @name         iconfont-pusher
// @version      0.1
// @description  iconfont刷新资源链接时，一并推送到我们的服务器
// @author       liuwenfeng
// @match        *://www.iconfont.cn/manage/index*
// @require      https://cdn.bootcss.com/qs/6.8.0/qs.min.js
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @require      https://cdn.bootcss.com/axios/0.19.0/axios.min.js
// @require      https://cdn.bootcss.com/js-cookie/2.2.1/js.cookie.min.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
  'use strict';

  /**
   * MEMO：
   * 以下脚本依托iconfont.cn的具体dom结构，如果其ui改版等造成dom变更，需要响应更新以下脚本
   */

  var $ = $ || window.$;
  var Qs = Qs || window.Qs;
  var Cookies = Cookies || window.Cookies;
  var axios = axios || window.axios;
  var pushing = false;

  // iconfont页面加载完后再执行初始化脚本
  window.onload = () => {
    setTimeout(() => {
      init();
    }, 2000);
  };

  // 初始化
  function init() {
    // 仅在“我的项目”tab页中创建“推送”按钮
    const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
    if (query.manage_type === 'myprojects') {
      createPushBtn();
    }

    /**
     * iconfont.cn使用magix，目前没有找到合适的方式兼容路由来控制“推送”按钮的显示。
     * 1、header中的导航都会刷新页面，脚本能重新初始化
     * 2、/manage/index页面中路由变更，可使用tab切换的监听来mock处理
     */
    $('.block-bar-left .block-bar-tab li').on('click', e => {
      // 由于拿不到路由变更的hook，且点击tab取到的是变更前的路由，所以这里使用timer确保正常情况下能取到跳转路由
      setTimeout(() => {
        // 每次路由变更，magix会重新加载dom，原先添加的“推送”按钮也会被清除，需重新生成
        const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
        if (query.manage_type === 'myprojects') {
          createPushBtn();
        }
      }, 0);
    });
  }

  // 创建“推送至webtool”按钮
  function createPushBtn() {
    if ($('#sm_pusher').length > 0) {
      return;
    }
    const $myBtn = $(
      '<span id="sm_pusher" title="推送至webtool" class="iconfont radius-btn" style="background:#658cfd;">推</span>',
    );
    $myBtn.on('click', handlePush);
    $('.block-bar-right .block-radius-btn-group').append($myBtn);
  }

  // “推送”按钮动效
  function rotatePushBtn(rotating) {
    const $myBtn = $('#sm_pusher');
    if (rotating) {
      // 假装是动画吧
      $myBtn.css('transition', 'all linear 100s');
      $myBtn.css('transform', 'rotate(36000deg)');
    } else {
      $myBtn.css('transition', '');
      $myBtn.css('transform', 'rotate(0)');
    }
  }

  // 数据推送请求
  async function handlePush() {
    if (pushing) {
      console.log('is pushing');
      return;
    }

    const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
    const ctoken = Cookies.get('ctoken');
    try {
      let data = {};

      pushing = true;
      rotatePushBtn(true);

      // 1、从iconfont.cn拉取项目信息，判断是否需要更新
      const { data: detail } = await axios.get('/api/project/detail.json', {
        baseURL: 'https://www.iconfont.cn',
        params: {
          t: new Date().getTime(),
          ctoken: ctoken,
          pid: query.projectId,
        },
      });

      if (detail.code !== 200) {
        throw new Error('error');
      }
      data = {
        pid: detail.data.font.owner_id,
        css_file: detail.data.font.css_file,
        eot_file: detail.data.font.eot_file,
        js_file: detail.data.font.js_file,
        svg_file: detail.data.font.svg_file,
        ttf_file: detail.data.font.ttf_file,
        woff2_file: detail.data.font.woff2_file,
        woff_file: detail.data.font.woff_file,
      };
      // 2、font_is_old为1，则更新资源链接
      if (detail.data.project.font_is_old === 1) {
        const { data: update } = await axios.post(
          '/api/project/cdn.json',
          {
            t: new Date().getTime(),
            ctoken: ctoken,
            pid: query.projectId,
          },
          {
            baseURL: 'https://www.iconfont.cn',
          },
        );

        if (update.code !== 200) {
          throw new Error('error');
        }
        // 更新接口只会返回文件名，需要补全链接地址
        const prefix = '//at.alicdn.com/t';
        data = {
          ...data,
          css_file: prefix + '/' + update.data.css_file + '.css',
          eot_file: prefix + '/' + update.data.eot_file + '.eot',
          js_file: prefix + '/' + update.data.js_file + '.js',
          svg_file: prefix + '/' + update.data.svg_file + '.svg',
          ttf_file: prefix + '/' + update.data.ttf_file + '.ttf',
          woff2_file: prefix + '/' + update.data.woff2_file + '.woff2',
          woff_file: prefix + '/' + update.data.woff_file + '.woff',
        };
      }

      // 3、将资源链接推送private服务器
      const { data: push } = await axios.post(
        '/iconfont-post/' + data.pid,
        data,
        {
          baseURL: 'http://localhost:3000',
        },
      );
      if (push.code !== 200) {
        throw new Error('error');
      }
      // 更新页面
      $('.block-bar-left .block-bar-tab li')
        .last()
        .find('a')[0]
        .click();
    } catch (e) {
      alert('推送失败，请稍后重试！');
    } finally {
      pushing = false;
      rotatePushBtn(false);
    }
  }
})();
