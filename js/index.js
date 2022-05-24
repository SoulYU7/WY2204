function Mainpulation(){
    
    this.$();
    this.bindEvent();
}

Mainpulation.prototype.bindEvent = function(){
  this.$(".conserve-data").addEventListener("click" , this.conserve())
  //删除事件
  //通过事件委托给tbody绑定事件找到tbody下的删除修改节点
  //将子元素的事件委托给tbody
  this.$(".table tbody").addEventListener("click" , this.distribute.bind(this));
  //给删除模态框的确认按钮绑定事件
  this.$(".confirm-del").addEventListener("click" , this.confirmdel.bind(this));//改变this指向是因为事件函数this指向事件源改变this指向为类方便使用
  //非修改模态框添加事件
  this.$(".modify-data").addEventListener("click" , this.saveModify.bind(this));
}

Mainpulation.prototype.$ = function(ele){
    let res = document.querySelectorAll(ele);
    return res.length == 1 ? res[0] : res;
}

Mainpulation.prototype.conserve = function(){
 let inputs = document.forms[0].elements;//获取到表单中的input集合
  //防止框中输入空格用trim()去除空格
  //获取每个input的vlaue值
  let place = this.inputs.place.value.trim();//也可变量名与属性名不一样
  let kind = this.inputs.kind.value.trim();
  let num = this.inputs.kind.value.trim();

  //判断表单中每一项是否都填入内容，如果有一项没有则抛出错误
  if(!place || !kind || !num){
      throw new Error("表单不能为空");
  };


  //讲述通过ajax发送给json-server服务器，进行保存
  //json-server 中的post请求是添加数据的//详情通过json-server手册
  axios.post("http://localhost:3000/record",{
      place,//属性名呵呵变量名一样时可以这样写不一样不行
      kind,
      num
  }).then(res=>{
      if(res.status == 201){
          location.reload()//成功时重新载入文档刷新页面
      }
  });//接收成功返回的值
}


Mainpulation.prototype.getData = function(){//post 和get是看手册手册josn-server
  //发送ajax请求获取到数据
  axios.get("http://localhost:3000/record")
  .then(res=>{//.then (function(res){//这里用function中的this会指向window不指向类})
      let {data ,status} = res;
      //解构赋值获取返回之中的data和status
      if(status == 200){
          //请求成功后
          //将内容追加到页面
          let html = "";
          data.forEach(ele =>{
              html += `<tr>
              <th scope="row">${ele.id}</th>
              <td>${ele.place}</td>
              <td>${ele.kind}</td>
              <td>${ele.num}</td>
              <td><button type="button" class="btn btn-danger btn-xs findyou-del"><span class="glyphicon glyphicon-trash findyou-del" aria-hidden="true"></span></button>
              <button type="button" class="btn btn-warning btn-xs findyou-modify"><span class="glyphicon glyphicon-pencil findyou-modify" aria-hidden="true"></span></button></td>
              </tr>`
          })
          // console.log(this);
          this.$(".table tbody").innerHTML = html;
          // console.log(html);
      }//获取dbjson中数据到页面
  })
  
}

distribute(eve){//eve传参获取事件event
  //获取事件源
  let targets = eve.target;
  //判断点击的是删除还是修改
  if(targets.classList.contains("findyou-del")) this.delData(targets);//找到删除执行函数delData传参<事件源>
  if(targets.classList.contains("findyou-modify")) this.modifyData(targets);//找到修改
}
delData(tar){
  //弹出删除模态框
  $("#delModal").modal("show");
  //把传入的参数事件源给到类的属性上存储起来
  this.tar = tar;//删除的时候使用
}

Mainpulation.prototype.confirmdel = function(){
  //删除数据需要获取到id
  let id = "";//变量id存储id
  //因为点击时有可能点到span也可能点到button要区分
  if(this.tar.nodeName == "SPAN"){
      //如果点击的是span要找到他上边的tr才能获取到id
      let trObj = this.tar.parentNode.parentNode.parentNode;
      //span的父节点父节点父节点是tr
      id = trObj.firstElementChild.innerHTML;//id是tr下的第一个子元素
  }
  if(this.tar.nodeName == "BUTTON"){
      let trObj = this.tar.parentNode.parentNode;
      id = trObj.firstElementChild.innerHTML;
  }

  //将获取的id发送给json-server服务器删除对应数据刷新页面
  //   /再json-server服务器当这寻找对应删除接口 //附属路由里面 >>DELETE /posts/1 发送delete请求代表删除 ，再axios中查看是否支持，支持
  axios.delete("http://localhost:3000/record/" + id)
  .then(res=>{
      if(res.status == 200){
          location.reload();
      }
  })
}

Mainpulation.prototype.modifyData = function(tar){
  //弹出修改模态框
  $("#modifyModal").modal("show");
  $("#qaq").popover('hide');

  //判断点击的是span还是button
  let trObj = "";//获取到tr
  if(tar.nodeName == "SPAN"){
      trObj = tar.parentNode.parentNode.parentNode;
  }
  if(tar.nodeName == "BUTTON"){
      trObj = tar.parentNode.parentNode;
  }
  // console.log(trObj);
  //获取到所有tr的子节点以拿到数据
  let childs = trObj.children;
  let id = childs[0].innerHTML;
  let place = childs[1].innerHTML;
  let kind = childs[2].innerHTML;
  let num = childs[3].innerHTML;
  
  //展示到模态框
  //获取此时ipnut框中的value值，添加到页面
  let inputs = this.$("#modifyModal form").elements;
  // console.log(inputs);
  inputs.place.value = place;
  inputs.kind.value = kind;
  inputs.num.value = num;

  //将id设置为类属性方便调用再saveMdify
  this.modifyId = id;
  
}

Mainpulation.prototype.saveModify = function(){
        
  let {place , kind , num} = this.$("#modifyModal form").elements;
  console.log(place , kind , num);
  let placeValue = place.value.trim();
  let kindValue = kind.value.trim();
  let numValue = num.value.trim();
  if(!placeValue || !kindValue ||!numValue){
      $("#qaq").popover('show');
      return;
  }

  axios.put("http://localhost:3000/record/" + this.modifyId ,{
      place: placeValue,
      kind : kindValue,
      num : numValue
  }).then(res=>{
      if(res.status == 200){
          location.reload();
      }
  })
}


new Mainpulation();