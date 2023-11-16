import { genMermaid } from "llm-ops";
const replaceContentWithSequence = (text: string) => {
  let index = 1;
  return text.replace(
    /(\[).*?(\])|(\().*?(\))|(\{).*?(\})|(\").*?(\")|(\|).*?(\|)/g,
    (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10) => {
      if (p1 && p2) {
        return `${p1}#${index++}${p2}`;
      }
      if (p3 && p4) {
        return `${p3}#${index++}${p4}`;
      }
      if (p5 && p6) {
        return `${p5}#${index++}${p6}`;
      }
      if (p7 && p8) {
        return `${p7}#${index++}${p8}`;
      }
      if (p9 && p10) {
        return `${p9}#${index++}${p10}`;
      }
      return match;
    },
  );
};
genMermaid({
  request:
    "这是一个公司介绍的文本，总分布局：VTRON作为一家中国公司成立于1998年，总部位于广东省广州市广州科学城开发区；是专业从事高清晰数字显示系统研发、生产、销售与服务的创新型科技企业，它是全球同行业瞩目的集中信息显示系统产品制造基地，它拥有了全系列产品的国际尖端技术和自主知识产权，它一直保持在同行业技术及产品的领先优势",
}).then((res) => {
  console.log(res);
  console.log(replaceContentWithSequence(res));
});
