import * as path from 'path';

import APIRequestManager from './clases/APIRequestManager';
import Usuario from './clases/usuario/usuario';
import JSONFileManager from './clases/JSONFileManager';

export default async function extractMyUser(apiRequestManager: APIRequestManager, path_save: string): Promise<Usuario> {
    const myUser: Usuario = await Usuario.getMyUser(apiRequestManager);

    const jsonFileManager = new JSONFileManager(path.resolve(path_save, `myUser.json`));
    await jsonFileManager.writeJSON(myUser);

    return myUser;
}
