import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation, Trans } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { PiFloppyDiskBackDuotone, PiMagnifyingGlassDuotone, PiXCircleDuotone } from "react-icons/pi"
import semver from "semver"

import { useNotificationsContext } from "@renderer/contexts/NotificationsContext"
import { useConfigContext, CONFIG_ACTIONS } from "@renderer/features/config/contexts/ConfigContext"

import {
  FormBody,
  FormHead,
  FormLabel,
  FromGroup,
  FromWrapper,
  ButtonsWrapper,
  FormFieldGroup,
  FormFieldDescription,
  FormButton,
  FormLinkButton,
  FormInputText,
  FormFieldGroupWithDescription,
  FormGroupWrapper,
  FormInputNumber,
  FormToggle
} from "@renderer/components/ui/FormComponents"
import { TableBody, TableBodyRow, TableCell, TableHead, TableHeadRow, TableWrapper } from "@renderer/components/ui/Table"
import ScrollableContainer from "@renderer/components/ui/ScrollableContainer"
import { LinkButton, NormalButton } from "@renderer/components/ui/Buttons"

function AddInslallation(): JSX.Element {
  const { t } = useTranslation()
  const { addNotification } = useNotificationsContext()
  const { config, configDispatch } = useConfigContext()
  const navigate = useNavigate()

  const [name, setName] = useState<string>(t("features.installations.defaultName"))
  const [folder, setFolder] = useState<string>("")
  const [folderByUser, setFolderByUser] = useState<boolean>(false)
  const [version, setVersion] = useState<GameVersionType>([...config.gameVersions].sort((a, b) => semver.compare(b.version, a.version))[0])
  const [startParams, setStartParams] = useState<string>("")
  const [backupsLimit, setBackupsLimit] = useState<number>(3)
  const [backupsAuto, setBackupsAuto] = useState<boolean>(false)
  const [compressionLevel, setCompressionLevel] = useState<number>(6)
  const [mesaGlThread, setMEsaGlThread] = useState<boolean>(false)

  useEffect(() => {
    ;(async (): Promise<void> => {
      if (name && !folderByUser) setFolder(await window.api.pathsManager.formatPath([config.defaultInstallationsFolder, name.replace(/[^a-zA-Z0-9]/g, "-")]))
    })()
  }, [name])

  const handleAddInstallation = async (): Promise<void> => {
    if (!name || !folder || !version || !backupsLimit || backupsAuto === undefined) return addNotification(t("notifications.body.missingFields"), "error")

    if (name.length < 5 || name.length > 50) return addNotification(t("features.installations.installationNameMinMaxCharacters", { min: 5, max: 50 }), "error")

    if (folder === config.backupsFolder || config.installations.some((i) => i.path === folder) || config.gameVersions.some((gv) => gv.path === folder))
      return addNotification(t("features.installations.folderAlreadyInUse"), "error")

    if (startParams.includes("--dataPath")) return addNotification(t("features.installations.cantUseDataPath"), "error")

    try {
      const newInstallation: InstallationType = {
        id: uuidv4(),
        name,
        path: folder,
        version: version.version,
        startParams,
        backupsLimit,
        backupsAuto,
        compressionLevel,
        backups: [],
        lastTimePlayed: -1,
        totalTimePlayed: 0,
        mesaGlThread,
        _modsCount: 0
      }

      configDispatch({ type: CONFIG_ACTIONS.ADD_INSTALLATION, payload: newInstallation })
      window.api.pathsManager.ensurePathExists(folder)
      addNotification(t("features.installations.installationSuccessfullyAdded"), "success")
      navigate("/installations")
    } catch (error) {
      addNotification(t("features.installations.errorAddingInstallation"), "error")
    }
  }

  return (
    <ScrollableContainer>
      <div className="min-h-full flex flex-col justify-center gap-4">
        <h1 className="text-3xl text-center font-bold">{t("features.installations.addTitle")}</h1>

        <FromWrapper className="max-w-[800px] w-full">
          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.installations.name")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputText
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                    }}
                    placeholder={t("features.installations.defaultName")}
                    minLength={5}
                    maxLength={50}
                  />
                  <FormFieldDescription content={t("generic.minMaxLength", { min: 5, max: 50 })} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.versions.labelGameVersion")} />
              </FormHead>

              <FormBody>
                <TableWrapper>
                  <TableHead>
                    <TableHeadRow>
                      <TableCell className="w-full text-center">{t("generic.version")}</TableCell>
                    </TableHeadRow>
                  </TableHead>

                  <TableBody className="max-h-[250px]">
                    {config.gameVersions.length < 1 && (
                      <div className="w-full p-1 flex flex-col items-center justify-center">
                        <p>{t("features.versions.noVersionsFound")}</p>
                        <p className="text-zinc-400 text-sm flex gap-1 items-center flex-wrap justify-center">
                          <Trans
                            i18nKey="features.versions.noVersionsFoundDesc"
                            components={{
                              link: (
                                <LinkButton title={t("components.mainMenu.versionsTitle")} to="/versions" className="text-vsl">
                                  {t("components.mainMenu.versionsTitle")}
                                </LinkButton>
                              )
                            }}
                          />
                        </p>
                      </div>
                    )}
                    {config.gameVersions
                      .slice()
                      .sort((a, b) => semver.rcompare(a.version, b.version))
                      .map((gv) => (
                        <TableBodyRow key={gv.version} onClick={() => setVersion(gv)} selected={version?.version === gv.version}>
                          <TableCell className="w-full">{gv.version}</TableCell>
                        </TableBodyRow>
                      ))}
                  </TableBody>
                </TableWrapper>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.installations.dataFolder")} />
              </FormHead>

              <FormBody>
                <FormFieldGroup alignment="x">
                  <FormButton
                    onClick={async () => {
                      const path = await window.api.utils.selectFolderDialog()
                      if (path && path.length > 0) {
                        if (!(await window.api.pathsManager.checkPathEmpty(path))) addNotification(t("notifications.body.folderNotEmpty"), "warning")

                        setFolder(path)
                        setFolderByUser(true)
                      }
                    }}
                    title={t("generic.browse")}
                    className="h-8 px-2 py-1"
                  >
                    <PiMagnifyingGlassDuotone />
                  </FormButton>
                  <FormInputText placeholder={t("features.installations.installationFolder")} value={folder} onChange={(e) => setFolder(e.target.value)} minLength={1} className="w-full" />
                </FormFieldGroup>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>

          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.backups.backupsAmount")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputNumber
                    placeholder={t("features.backups.backupsLimit")}
                    value={backupsLimit}
                    onChange={(e) => setBackupsLimit(Number(e.target.value))}
                    min={0}
                    max={10}
                    className="w-full"
                  />
                  <FormFieldDescription content={t("generic.minMaxAmmount", { min: 0, max: 10 })} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.backups.automaticBackups")} className="max-h-6" />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription alignment="x">
                  <FormToggle title={t("features.backups.backupsAuto")} value={backupsAuto} onChange={setBackupsAuto} />
                  <FormFieldDescription content={t("features.backups.backupsAuto")} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("generic.compression")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputNumber
                    placeholder={t("features.backups.compressionLevel")}
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(Number(e.target.value))}
                    min={0}
                    max={9}
                    className="w-full"
                  />
                  <FormFieldDescription content={`${t("generic.minMaxAmmount", { min: 0, max: 9 })} · ${t("features.backups.compressionLevelDesc")}`} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>

          <FormGroupWrapper>
            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.installations.labelStartParams")} />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription>
                  <FormInputText
                    value={startParams}
                    onChange={(e) => {
                      setStartParams(e.target.value)
                    }}
                    placeholder={t("features.installations.startParams")}
                  />
                  <FormFieldDescription
                    content={
                      <Trans
                        i18nKey="features.installations.startParamsDesc"
                        components={{
                          link: (
                            <NormalButton
                              title={t("features.installations.startParamsLink")}
                              onClick={() => window.api.utils.openOnBrowser("https://wiki.vintagestory.at/Client_startup_parameters")}
                              className="text-vsl"
                            >
                              {t("features.installations.startParamsLink")}
                            </NormalButton>
                          )
                        }}
                      />
                    }
                  />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>

            <FromGroup>
              <FormHead>
                <FormLabel content={t("features.installations.mesaGlThread")} className="max-h-6" />
              </FormHead>

              <FormBody>
                <FormFieldGroupWithDescription alignment="x">
                  <FormToggle title={t("features.installations.mesaGlThreadDesc")} value={mesaGlThread} onChange={setMEsaGlThread} />
                  <FormFieldDescription content={t("features.installations.mesaGlThreadDesc")} />
                </FormFieldGroupWithDescription>
              </FormBody>
            </FromGroup>
          </FormGroupWrapper>
        </FromWrapper>

        <ButtonsWrapper className="text-lg">
          <FormLinkButton to="/installations" title={t("generic.goBack")} type="error" className="p-2">
            <PiXCircleDuotone />
          </FormLinkButton>
          <FormButton onClick={handleAddInstallation} title={t("generic.add")} type="success" className="p-2">
            <PiFloppyDiskBackDuotone />
          </FormButton>
        </ButtonsWrapper>
      </div>
    </ScrollableContainer>
  )
}

export default AddInslallation
