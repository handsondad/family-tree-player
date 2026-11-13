# 认亲戚大冒险

给孩子玩的认亲戚小游戏：小念和爸爸带着认识一大家子，知道每位亲戚该怎么叫、TA 又怎么叫你。界面和小念、爸爸的形象与声音都照着 bodyverse。

- **认一认**：家族树（47 位亲戚）、称呼小火车、小念问爸爸（亲戚文化冷知识一问一答）、各地叫法大不同（8 大方言对照）
- **玩一玩**：称呼大闯关、过年拜年、辈分排排站、爸爸家还是妈妈家、翻牌配对

## 开发

```bash
npm install
npm run dev        # 本地预览
npm test           # 称呼核对、出题、配音覆盖
npm run typecheck
npm run build
npm run voice      # 改了台词后重新配音
```

推到 `main` 后，GitHub Actions 会先跑测试、再打包，发布到 GitHub Pages：<https://handsondad.github.io/family-tree-player/>。第一次用要在仓库的 Settings → Pages 里把 Source 设成 "GitHub Actions"。

`npm run voice` 需要联网，还要先装好 `python -m pip install edge-tts`，PATH 里要有 ffmpeg / ffprobe。它只生成新的或改过的句子，可以随时中断再续。

## 说明

- 称呼计算用的是开源的 [relationship-ts](https://github.com/ExploringTheCodeWorld/relationship-ts)（MIT）。
- 小念和爸爸的配音用微软 Edge 在线语音（edge-tts）生成，只按家庭和非商业使用考虑。
- 各地叫法不太一样，以家里大人教的为准。

完整清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
