import { Logger } from 'nestjs-universal-logger';
import { Observable } from 'rxjs';
import { retryWhen, delay, scan } from 'rxjs/operators';

export const handleRetry = (
  name: string,
  logger: Logger,
  retryAttempts = 9,
  retryDelay = 3000,
): (<T>(source: Observable<T>) => Observable<T>) => {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error) => {
            logger.error(
              `Unable to connect to the ${name}. Retrying (${
                errorCount + 1
              })...`,
              '',
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
};
