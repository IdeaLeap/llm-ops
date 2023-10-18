import { genMermaid } from "llm-ops";
const replaceContentWithSequence = (text:string) => {
  let index = 1;
  return text.replace(/(\[).*?(\])|(\().*?(\))|(\{).*?(\})|(\").*?(\")|(\|).*?(\|)/g, (match, p1, p2, p3, p4, p5, p6, p7, p8,p9,p10) => {
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
  });
};
genMermaid({
  request:
    "在对数字化转型的探讨中，技术、策略和人是三大核心要素。技术为数字化转型提供了可能性，允许企业利用先进的工具和平台去优化、创新和扩展其业务范围。而策略则为数字化转型提供了方向，确保企业的技术部署与其长期的商业目标和愿景相一致。最后，人是数字化转型的中心，因为不论有多先进的技术或策略，如果员工和客户不能或不愿适应新的变革，那么转型就不可能成功。因此，在进行数字化转型时，企业必须确保技术的适用性、策略的明晰性和人的参与性，以确保转型的全面性和成功性。",
}).then((res) => {
  console.log(res);
  console.log(replaceContentWithSequence(res));
});
