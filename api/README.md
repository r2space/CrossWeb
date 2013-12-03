API Documentation
=================

Smart平台API是与后台数据进行交互的手段，入门非常容易。与Smart平台交互，数据全部使用*Json*格式，
并使用*RESTfull（Representational State Transfer）*风格。
我们对客户端应用开发不做限制，Web应用移动终端应用，桌面客户端应用都可以以同样的方式与Smart平台进行交互。

  关于JSON，请参考  <http://www.json.org/>  
  关于REST，请参考  <http://zh.wikipedia.org/wiki/REST>  

---
Getting Started
---------------
API分两类，一类需要通过认证（即用户校验。需要正确的用户名/密码）后方可使用，
另一则类无需认证可直接使用。

* API URL - http://10.2.8.234:3000/[target] 其中的target就是具体REST API
* 开发用用户名密码 - ssmartdb / ssmartdb

#####使用 *jQuery* 在Javascript里调用 *'/search'* API的例子：
 
    $.ajax({
      type: "GET",
      url: "/search/quick.json",
      data: { txt: val },
      dataType: "json"
    }).done(function(msg) {
      $('#resultlist').append('<li><a href="#">' + msg.result + '</a></li>');
    });

#####HTTP Methods为GET类API，可以在浏览器输入URL确认确。同样以 *'/search'*  为例子：

    http://10.2.8.234:3000/search/quick.json?txt=hello
    ## 返回结果 ##
    {
      type: "User",
      result: "hello"
    }

---
The REST API
------------

#### 01.[文档操作（文档模板的定义，文档的CRUD）](./document.js.html)
 * [获取用户最近修改过的文件(/document/lastmodified.json)](./document.js.html#section-2)
 * [获取用户最近查看的文件(/document/lastviewed.json)](./document.js.html#section-3)
 * [获取用户关注的文件(/document/followed.json)](./document.js.html#section-4)
 * [创建文件(/document/create.json)](./document.js.html#section-5)
 * [更新文件(/document/update.json)](./document.js.html#section-6)
 * [文件作为模板(/document/istemplate.json)](./document.js.html#section-7)
 * [删除文件(/document/delete.json)](./document.js.html#section-8)
 * (再考虑一下)[获取文件一览(/document/view.json)](./document.js.html#section-9)

#### 02.[组的操作](./group.js.html)
 * [创建组(/group/create.json)](./group.js.html#section-2)
 * [删除组(/group/destroy.json)](./group.js.html#section-3)
 * (需要思考)[获取组织一览(/group/view.json)](./group.js.html#section-4)

#### 03.[组相关](./groupprofile.js.html)
 * [获取组的文件一览(/groupprofile/document.json)](./groupprofile.js.html#section-2)
 * [获取组的详细信息(/groupprofile/detail.json)](./groupprofile.js.html#section-3)
 * (有待考虑)[更新组的详细信息(/groupprofile/update.json)](./groupprofile.js.html#section-4)
 * [获取组成员(/groupprofile/member.json)](./groupprofile.js.html#section-5)
 * [添加组成员(/groupprofile/addmember.json)](./groupprofile.js.html#section-6)
 * [删除组成员(/groupprofile/deletemember.json)](./groupprofile.js.html#section-7)
 * [加入组(/groupprofile/join.json)](./groupprofile.js.html#section-8)
 * [退出组(/groupprofile/exit.json)](./groupprofile.js.html#section-9)
 * [成为管理者(/groupprofile/isadminister.json)](./groupprofile.js.html#section-10)
 * [取消管理者身份(/groupprofile/notadminister.json)](./groupprofile.js.html#section-11)

#### 04.[用户信息](./user.js.html)
 * [获取用户的基本信息(/user/basic.json)](./user.js.html#section-2)
 * [获取用户的详细信息(/user/detail.json)](./user.js.html#section-3)
 * [更新详细信息(/user/update.json)](./user.js.html#section-4)
 * [删除详细信息(/user/delete.json)](./user.js.html#section-5)
 * [获取用户的联系方式(/user/contact.json)](./user.js.html#section-6)
 * （未编辑）[获取用户的通知方式(/user/notice.json)](./user.js.html#section-7)
 * [获取用户的工作教育信息(/user/career.json)](./user.js.html#section-8)
 * [获取用户所在的组(/user/atgroup.json)](./user.js.html#section-9)

#### 05.[用户相关（消息，文件，process）](./userprofile.js.html)
 * [获取用户的消息(/userprofile/message.json)](./userprofile.js.html#section-2)
 * [获取用户的process(/userprofile/process.json)](./userprofile.js.html#section-3)
 * [获取用户更新的文件(/userprofile/document.json)](./userprofile.js.html#section-4)

#### 06.[业务流程（流程的定义，流程的审批等）](./process.js.html)
 * [创建业务流程(/process/create.json)](./process.js.html#section-2)
 * [更新业务流程(/process/update.json)](./process.js.html#section-3)
 * [删除业务流程(/process/delete.json)](./process.js.html#section-4)
 * [开始业务(/process/start.json)](./process.js.html#section-5)
 * [终止业务(/process/stop.json)](./process.js.html#section-6)
 * [实施业务(/process/approve.json)](./process.js.html#section-7)


#### 其他
* 07.[简单认证](./auth.js.html)
 * [Login 验证(/auth/login.json)](./auth.js.html#section-2)
 * [Logout 验证(/auth/logout.json)](./auth.js.html#section-3)
 * [更新密码(/auth/passwd.json)](./auth.js.html#section-4)
* 08.[检索](./search.js.html)
 * [快速检索(/search/quick.json)](./search.js.html#section-2)
 * [全检索(/search/full.json)](./search.js.html#section-3)
* 09.通知
 * 新建通知(/notice/create.json)
 * 查看通知(/notice/view.json)
* 10.[上传](./uploader.js.html)
 * [多种文件上传（/uploader/up.json）](./uploader.js.html#section-2)
* 11.权限
* 12.工具

---
认证（Authentication）及安全
---------------------
####基本认证：
Smart平台的很多API需要用户验证。当第一访问平台时，系统会向客户端发放标示用cookie。客户端应用需要保持这些信息，访问需要用户验证的API时，应该在Request的Header设置该cookie。信息格式如下：
  
    key : smart.sid
    val : s%3ANJk0hY7s12YHG7I%2BlGRNrvsh.IdWZIJFsdbEpNVkC2rWedzAhxWcMzhRTHF0e759uKsM; Path=/; HttpOnly

注：通常，Web应用开发时，浏览器为我们做了获取，保存，设置cookie的任务。

####Oauth2.0认证：
暂无计划...

####CSRF：
Smart平台处于安全考虑，需要客户端访问时携带CSRF的token。认证成功时，返回的结果中会带有该token。格式如下：

    kye : _csrf
    val : 5JibxF11ko6Vzg/lih5QvyPa

---
错误处理（Error Handling）
--------------------
####HTTP Status Codes:

    200 OK
    304 Not Modified
    400 Bad Request
    401 Unauthorized
    403 Forbidden
    404 Not Found
    406 Not Acceptable
    420 Enhance Your Calm
    500 Internal Server Error
    502 Bad Gateway
    503 Service Unavailable
    504 Gateway timeout

####Error Messages:

    {
      "errors":[{
        "code": "10110",
        "message": "invalid url"
      }]
    }

####Error Codes:

  <table>
    <tr>
      <th style="border: 1px #e3e3e3 solid; background: #ddddff;">code</th>
      <th style="border: 1px #e3e3e3 solid; background: #ddddff;">message</th>
      <th style="border: 1px #e3e3e3 solid; background: #ddddff;">detail</th>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">10000</td>
      <td style="border: 1px #e3e3e3 solid;" colspan="2">系统相关</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 10010</td>
      <td style="border: 1px #e3e3e3 solid;">internal error</td>
      <td style="border: 1px #e3e3e3 solid;">系统异常</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 10011</td>
      <td style="border: 1px #e3e3e3 solid;">invalid csrf token</td>
      <td style="border: 1px #e3e3e3 solid;">没有指定token，或token无效</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 10012</td>
      <td style="border: 1px #e3e3e3 solid;">internal cookie</td>
      <td style="border: 1px #e3e3e3 solid;">没有cookie信息，或cookie格式无效</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">20100</td>
      <td style="border: 1px #e3e3e3 solid;" colspan="2">用户操作，认证相关</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 20101</td>
      <td style="border: 1px #e3e3e3 solid;"></td>
      <td style="border: 1px #e3e3e3 solid;">用户ID不能为空</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 20102</td>
      <td style="border: 1px #e3e3e3 solid;"></td>
      <td style="border: 1px #e3e3e3 solid;">密码不能为空</td>
    </tr>
    <tr>
      <td style="border: 1px #e3e3e3 solid;">+ 20102</td>
      <td style="border: 1px #e3e3e3 solid;"></td>
      <td style="border: 1px #e3e3e3 solid;">密码不正确</td>
    </tr>
  </table>

####Error Codes Structure:

    例：20101
     第一位 - 错误级别， 1：系统错误 2：应用错误。
     二三位 - 模块号， 从1递增 1-99。
     四五位 - 错误号码， 从1递增 1-99。


移动终端（Smart Phone）
-----------------

Web应用（Websites）
---------------

Guidelines and Terms
--------------------

资源下载
----
