const stopWords = new Set('我们你们他们以及一个一种进行通过可以需要相关工作负责能力具备要求优先内容用户岗位项目公司团队'.split(''));
const textBox = document.querySelector('#sourceText');
const result = document.querySelector('#result');

const sample = `小红书社区运营岗位面向2027届毕业生。你将参与社区内容生态建设，洞察用户需求与内容趋势，策划并落地线上活动，协同产品、市场与设计团队推动项目。我们希望你有良好的内容敏感度和用户同理心，能使用数据发现问题，沟通推进能力强。有社区产品深度使用经验、校园媒体或内容运营经历者优先。`;

function sentences(text) {
  return text.replace(/\s+/g, ' ').split(/(?<=[。！？!?；;])/).map(s => s.trim()).filter(s => s.length > 8);
}

function summarize(text) {
  const list = sentences(text);
  if (!list.length) return [text.slice(0, 90)];
  const cue = /负责|目标|需要|要求|希望|核心|重点|结果|提升|降低|用户|数据/;
  const ranked = list.map((s, i) => ({ s, i, score: (cue.test(s) ? 3 : 0) + Math.min(s.length, 60) / 60 - i * .03 }))
    .sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.i - b.i);
  return ranked.map(x => x.s);
}

function keywords(text) {
  const candidates = text.match(/[\u4e00-\u9fa5]{2,6}|[A-Za-z][A-Za-z\s-]{2,20}/g) || [];
  const freq = {};
  candidates.forEach(w => {
    w = w.trim().toLowerCase();
    if (w.length > 1 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  const preferred = ['用户需求','内容生态','数据分析','项目管理','跨团队协作','内容趋势','社区运营','用户洞察'];
  const found = preferred.filter(w => text.includes(w));
  const common = Object.entries(freq).sort((a,b) => b[1]-a[1]).map(([w]) => w);
  return [...new Set([...found, ...common])].slice(0, 8);
}

function actions(text) {
  const output = [];
  if (/时间|日期|截止|届/.test(text)) output.push('确认时间节点与适用人群');
  if (/要求|能力|经验|优先/.test(text)) output.push('对照要求，标记已有证据与待补经历');
  if (/数据|指标|增长|提升/.test(text)) output.push('关注可量化指标和结果');
  if (/协同|沟通|团队/.test(text)) output.push('准备一则跨团队协作案例');
  return output.length ? output.slice(0, 3) : ['核对核心事实', '记录下一步行动'];
}

function render() {
  const text = textBox.value.trim();
  if (text.length < 20) { textBox.focus(); textBox.placeholder = '内容太短啦，请至少输入 20 个字。'; return; }
  document.querySelector('#summaryList').innerHTML = summarize(text).map(s => `<li>${s}</li>`).join('');
  document.querySelector('#keywordList').innerHTML = keywords(text).map(w => `<span>${w}</span>`).join('');
  document.querySelector('#actionList').innerHTML = actions(text).map(a => `<li>${a}</li>`).join('');
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior:'smooth', block:'start' });
}

document.querySelector('#sampleBtn').addEventListener('click', () => { textBox.value = sample; render(); });
document.querySelector('#summarizeBtn').addEventListener('click', render);
document.querySelector('#copyBtn').addEventListener('click', async (e) => {
  await navigator.clipboard.writeText(result.innerText.replace('复制结果','').trim());
  e.currentTarget.textContent = '已复制';
  setTimeout(() => e.currentTarget.textContent = '复制结果', 1200);
});
