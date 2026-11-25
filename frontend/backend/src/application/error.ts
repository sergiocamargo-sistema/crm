export class ApplicationError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class RevisionConflict extends ApplicationError {
  constructor() {
    super(409, 'REVISION_CHANGED', 'Os dados mudaram durante a operação. Tente novamente.');
  }
}
