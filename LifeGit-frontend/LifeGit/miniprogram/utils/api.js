// utils/api.js
// LifeGit 后端 API 对接层
// 后端响应格式: { code: 0, message: "ok", data: {...} }
var BASE_URL = 'http://localhost:5000';

var request = function(url, method, data) {
  method = method || 'GET';
  return new Promise(function(resolve, reject) {
    var token = wx.getStorageSync('token');
    var opts = {
      url: BASE_URL + url,
      method: method,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? ('Bearer ' + token) : ''
      },
      success: function(res) {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.navigateTo({ url: '/pages/login/login' });
          reject({ message: '未登录' });
          return;
        }
        var d = res.data;
        if (d && (d.code === 0 || d.code === 202)) {
          resolve(d.data);
        } else {
          wx.showToast({ title: (d && d.message) || '请求失败', icon: 'none' });
          reject(d);
        }
      },
      fail: function(err) {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      }
    };
    if (data && method !== 'GET' && method !== 'DELETE') {
      opts.data = data;
    }
    wx.request(opts);
  });
};

// 认证
var authLogin = function(data) {
  return request('/api/auth/login', 'POST', data);
};
var authRegister = function(data) {
  return request('/api/auth/register', 'POST', data);
};
var authProfile = function() {
  return request('/api/auth/profile');
};
var changePassword = function(data) {
  return request('/api/auth/change_password', 'POST', data);
};
var updateProfile = function(data) {
  return request('/api/auth/profile', 'PUT', data);
};

// 仓库
var createRepo = function(data) {
  return request('/api/repo/create_manual', 'POST', data);
};
var scanRepo = function(barcode) {
  return request('/api/repo/scan', 'POST', { barcode: barcode });
};
var confirmScanRepo = function(data) {
  return request('/api/repo/confirm_scan', 'POST', data);
};
var nlpAnalyze = function(text) {
  return request('/api/repo/nlp_analyze', 'POST', { text: text });
};
var confirmNlpRepo = function(data) {
  return request('/api/repo/confirm_nlp', 'POST', data);
};

var getMyRepos = function() {
  return request('/api/repo/my').then(function(data) {
    var repos = (data.repos || []).map(function(r) {
      return {
        id: r.id,
        name: r.name || r.product_name,
        type: r.type || 'item',
        brand: r.brand || '未知品牌',
        model: r.model || '-',
        spec: r.specification || '-',
        image: r.main_image || r.cover_image || '',
        eventCount: r.event_count || 0,
        createTime: r.create_time ? r.create_time.split(' ')[0] : ''
      };
    });
    // 后端列表接口可能不返回 event_count，逐个补充
    var detailPromises = repos.map(function(repo) {
      return request('/api/event/list/' + repo.id + '?page=1&page_size=1').then(function(d) {
        repo.eventCount = (d.pagination && d.pagination.total) || (d.events && d.events.length) || 0;
      }).catch(function() {});
    });
    return Promise.all(detailPromises).then(function() {
      return { repos: repos, pagination: data.pagination };
    });
  });
};

var deleteRepo = function(repoId) {
  return request('/api/repo/' + repoId, 'DELETE');
};

var getRepoDetail = function(repoId) {
  return request('/api/repo/' + repoId).then(function(data) {
    var repo = data.repo || {};
    var repoInfo = {
      id: repo.id,
      name: repo.name || repo.product_name,
      type: repo.type || 'item',
      brand: repo.brand || '',
      model: repo.model || '',
      spec: repo.specification || '',
      image: repo.main_image || repo.cover_image || '',
      description: repo.description || ''
    };
    var typeIcons = {
      purchase: '\u{1F6D2}', maintenance: '\u{1F527}', upgrade: '⬆️',
      experience: '\u{1F4AD}', memory: '\u{1F496}', fault: '⚠️', transfer: '\u{1F504}'
    };
    var events = (data.timeline || []).map(function(e) {
      return {
        id: e.id,
        type: e.event_type,
        icon: typeIcons[e.event_type] || '\u{1F4DD}',
        typeClass: e.event_type,
        description: e.description || '',
        content: e.content || {},
        images: e.images || [],
        time: e.create_time || ''
      };
    });
    return { repoInfo: repoInfo, events: events };
  });
};

// 事件
var getEventTypes = function(repoType) {
  var url = '/api/event/types';
  if (repoType) url += '?repo_type=' + repoType;
  return request(url);
};
var getEventSchema = function(eventType) {
  return request('/api/event/schema/' + eventType);
};
var checkEventConfirmation = function(eventType, eventData) {
  return request('/api/event/check_confirmation', 'POST', {
    event_type: eventType,
    data: eventData
  });
};
var createEvent = function(repoId, eventType, eventData, skipConfirmation) {
  return request('/api/event/create', 'POST', {
    repo_id: parseInt(repoId) || repoId,
    event_type: eventType,
    data: eventData,
    skip_confirmation: skipConfirmation || false
  });
};
var getEventList = function(repoId, page, pageSize) {
  page = page || 1;
  pageSize = pageSize || 10;
  return request('/api/event/list/' + repoId + '?page=' + page + '&page_size=' + pageSize);
};
var getEventDetail = function(eventId) {
  return request('/api/event/' + eventId);
};
var deleteEvent = function(eventId) {
  return request('/api/event/' + eventId, 'DELETE');
};

// 问答
var createIssue = function(repoId, title, content) {
  return request('/api/issue/create', 'POST', { repo_id: repoId, title: title, content: content });
};
var getIssueList = function(repoId, page, pageSize, status) {
  page = page || 1;
  pageSize = pageSize || 10;
  var url = '/api/issue/list/' + repoId + '?page=' + page + '&page_size=' + pageSize;
  if (status) url += '&status=' + status;
  return request(url);
};
var getIssueDetail = function(issueId) {
  return request('/api/issue/' + issueId);
};
var updateIssueStatus = function(issueId, status) {
  return request('/api/issue/' + issueId + '/status', 'PUT', { status: status });
};
var deleteIssue = function(issueId) {
  return request('/api/issue/' + issueId, 'DELETE');
};
var getIssueParticipants = function(repoId) {
  return request('/api/issue/' + repoId + '/participants');
};

// 回复
var createReply = function(issueId, content, mentionedUsers) {
  return request('/api/reply/create', 'POST', {
    issue_id: issueId, content: content, mentioned_users: mentionedUsers || []
  });
};
var setBestReply = function(replyId) {
  return request('/api/reply/' + replyId + '/best', 'PUT');
};
var cancelBestReply = function(replyId) {
  return request('/api/reply/' + replyId + '/cancel_best', 'PUT');
};

// @提醒
var getMyMentions = function(page, pageSize, isRead) {
  page = page || 1;
  pageSize = pageSize || 20;
  var url = '/api/mention/my?page=' + page + '&page_size=' + pageSize;
  if (isRead !== undefined) url += '&is_read=' + isRead;
  return request(url);
};
var readMention = function(mentionId) {
  return request('/api/mention/read/' + mentionId, 'PUT');
};
var readAllMentions = function() {
  return request('/api/mention/read_all', 'PUT');
};

// 文件上传
var uploadImage = function(filePath) {
  return new Promise(function(resolve, reject) {
    var token = wx.getStorageSync('token');
    wx.uploadFile({
      url: BASE_URL + '/api/upload/image',
      filePath: filePath,
      name: 'file',
      header: { 'Authorization': token ? ('Bearer ' + token) : '' },
      success: function(res) {
        var data = JSON.parse(res.data);
        if (data.code === 0) {
          console.log('[uploadImage] response data:', JSON.stringify(data.data));
          var result = data.data;
          var url = '';
          if (typeof result === 'string') {
            url = result;
          } else if (result) {
            url = result.url || result.image_url || result.file_url || result.path || result.src || '';
          }
          if (url && url.indexOf('http') !== 0 && url.indexOf('/') === 0) {
            url = BASE_URL + url;
          }
          console.log('[uploadImage] resolved url:', url);
          resolve(url);
        } else {
          reject(data);
        }
      },
      fail: function(err) { reject(err); }
    });
  });
};

var uploadImages = function(filePaths) {
  return new Promise(function(resolve, reject) {
    var token = wx.getStorageSync('token');
    wx.uploadFile({
      url: BASE_URL + '/api/upload/images',
      filePath: filePaths[0],
      name: 'files',
      header: { 'Authorization': token ? ('Bearer ' + token) : '' },
      success: function(res) {
        var data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          reject(data);
        }
      },
      fail: function(err) { reject(err); }
    });
  });
};

var uploadDocument = function(filePath) {
  return new Promise(function(resolve, reject) {
    var token = wx.getStorageSync('token');
    wx.uploadFile({
      url: BASE_URL + '/api/upload/document',
      filePath: filePath,
      name: 'file',
      header: { 'Authorization': token ? ('Bearer ' + token) : '' },
      success: function(res) {
        var data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          reject(data);
        }
      },
      fail: function(err) { reject(err); }
    });
  });
};

module.exports = {
  authLogin: authLogin,
  authRegister: authRegister,
  authProfile: authProfile,
  changePassword: changePassword,
  updateProfile: updateProfile,
  createRepo: createRepo,
  scanRepo: scanRepo,
  confirmScanRepo: confirmScanRepo,
  nlpAnalyze: nlpAnalyze,
  confirmNlpRepo: confirmNlpRepo,
  getMyRepos: getMyRepos,
  getRepoDetail: getRepoDetail,
  deleteRepo: deleteRepo,
  getEventTypes: getEventTypes,
  getEventSchema: getEventSchema,
  checkEventConfirmation: checkEventConfirmation,
  createEvent: createEvent,
  getEventList: getEventList,
  getEventDetail: getEventDetail,
  deleteEvent: deleteEvent,
  createIssue: createIssue,
  getIssueList: getIssueList,
  getIssueDetail: getIssueDetail,
  updateIssueStatus: updateIssueStatus,
  deleteIssue: deleteIssue,
  getIssueParticipants: getIssueParticipants,
  createReply: createReply,
  setBestReply: setBestReply,
  cancelBestReply: cancelBestReply,
  getMyMentions: getMyMentions,
  readMention: readMention,
  readAllMentions: readAllMentions,
  uploadImage: uploadImage,
  uploadImages: uploadImages,
  uploadDocument: uploadDocument
};
