function TokenId(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const token = originalMethod.apply(this, arguments);
    console.log(`${this.state.tokenId}, ${token.name}`);
    this.state.tokenId++;
    return token;
  };

  return descriptor;
}

export default TokenId;
