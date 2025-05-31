const parseTxt = async (buffer: Buffer): Promise<string> => {
  return buffer.toString("utf-8");
};

export default parseTxt;
