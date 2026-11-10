# 第三方素材和代码

## relationship-ts（MIT）

`src/vendor/relationship/` 里的称呼计算来自 [relationship-ts](https://github.com/ExploringTheCodeWorld/relationship-ts)，MIT 许可，原许可证见 `src/vendor/relationship/LICENSE`。

## 配音（Microsoft Edge 在线语音）

`public/voice/` 里的小念和爸爸的配音由 [edge-tts](https://github.com/rany2/edge-tts)（GPL-3.0，只在生成时使用，不随网站发布）调用微软 Edge"大声朗读"的在线神经语音生成，和 bodyverse 用的是同样的声音：小念 `zh-CN-YunxiaNeural`，爸爸 `zh-CN-YunxiNeural`（语速 -5%）。这项服务没有为批量生成音频单独给出授权条款，所以这些音频只按家庭和非商业用途考虑；公开发布或商用前，应改用有明确商用授权的语音服务（如 Azure AI Speech）重新生成。

## 小念和爸爸的形象

头像画法照着 bodyverse 项目里的小念和爸爸。
