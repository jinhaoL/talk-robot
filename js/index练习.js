(async function () {
    //检查是否登录
    const resp = await API.profile()
    const user = resp.data
    if (!user) {
        alert(`未登录或账号已过期`)
        //跳转到登录页
        location.href = `./login.html`
        return

    }
    //登录状态下,要进行的操作
    const doms = {
        aside: {
            nickName: $(`#nickname`),
            loginId: $(`#loginId`)
        },
        close: $(`.close`),
        chatContainer: $(`.chat-container`),
        txtMsg: $(`#txtMsg`),
        msgContainer: $(`.msg-container`)
    }
    //显示用户信息
    doms.aside.nickName.innerText = user.nickname
    doms.aside.loginId.innerText = user.loginId

    //注册退出登录事件
    doms.close.addEventListener(`click`, () => {
        API.loginOut()
        location.href = `./login.html`
    })

    //将时间戳转换为标准时间
    function formatDate(timeStamp) {
        const date = new Date(timeStamp)
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, `0`)
        const day = (date.getDay()).toString().padStart(2, `0`)
        const hour = (date.getHours()).toString().padStart(2, `0`)
        const minute = (date.getMinutes()).toString().padStart(2, `0`)
        const second = (date.getSeconds()).toString().padStart(2, `0`)

        return `${year}-${month}-${day}-${hour}:${minute}:${second}`
    }

    //增加信息
    //传入一个消息对象
    //{
    // content:"what are you doing?"
    // createdAt:1686990974429
    // from:"jinhao"
    // to:null
    // _id:"648d707e0d9b2d7e81df2edf"
    // }
    function addChat(chatInfo) {
        const div = $$$(`div`)
        div.classList.add(`chat-item`)
        if (chatInfo.from) {
            div.classList.add(`me`)
        }

        const img = $$$(`img`)
        img.classList.add(`chat-avatar`)
        img.src = chatInfo.from ? `./asset/avatar.png` : `./asset/robot-avatar.jpg`

        const content = $$$(`div`)
        content.classList.add(`chat-content`)
        content.innerText = chatInfo.content

        const date = $$$(`div`)
        date.classList.add(`chat-date`)
        date.innerText = formatDate(chatInfo.createdAt)

        div.appendChild(img)
        div.appendChild(content)
        div.appendChild(date)

        doms.chatContainer.appendChild(div)
        scrollBottom()
    }

    //加载历史记录
    async function loadHistory() {
        const resp = await API.getHistory()
        const datas = resp.data
        for (const key in datas) {
            addChat(datas[key])
        }
        scrollBottom()
    }
    loadHistory()

    //滚动到底部
    function scrollBottom() {
        const height = doms.chatContainer.scrollHeight
        doms.chatContainer.scrollTop = height
    }

    //发送消息
    async function sendChat() {
        const content = doms.txtMsg.value
        if (!content) {
            return
        }
        //现将发出的内容添加
        addChat({
            from: user.loginId,
            to: null,
            createdAt: Date.now(),
            content
        })
        doms.txtMsg.value = ``
        scrollBottom()
        const resp = await API.sendChat(content)
        addChat(resp.data)
    }

    //注册表单提交事件
    doms.msgContainer.addEventListener(`submit`,async function (e) {
        e.preventDefault()
        await sendChat()
    })
})();