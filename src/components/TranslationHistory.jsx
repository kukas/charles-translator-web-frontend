import React, { useState } from 'react'
import { Drawer, IconButton, Button, List, ListItemButton, ListSubheader, Tooltip } from '@mui/material'
import {
    History as HistoryIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Delete as DeleteIcon,
    DeleteForever as DeleteForeverIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    ArrowRight as ArrowRightIcon,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next';

import { changeStarInHistory, removeItemFromHistory } from '../history'

import * as styles from './TranslationHistory.module.scss'

export function TranslationHistory({ getHistory, onSelect }) {
    const [history, setHistory] = useState([])
    const [historyOpen, setHistoryOpen] = useState(false)

    const { t } = useTranslation()

    React.useEffect(() => {
        if (history.length === 0) setHistory(getHistory())
    }, [])

    function open() {
        setHistoryOpen(true)
        setHistory(getHistory())
    }

    function selectItem(item) {
        onSelect(item.text, item.fromLanguageId, item.toLanguageId)
        setHistoryOpen(false)
    }

    return (
        <div>
            <Tooltip title={t("common:history")}>
                <IconButton aria-label="history" size="large" onClick={open} sx={{ padding: 0 }}>
                    <HistoryIcon fontSize="inherit" />
                </IconButton>
            </Tooltip>

            <Drawer
                open={historyOpen}
                anchor="bottom"
                PaperProps={{
                    sx: { maxHeight: '60%' },
                }}
                onClose={() => setHistoryOpen(false)}
            >
                <List
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                        <div className={styles.header}>
                            <ListSubheader component="div" id="nested-list-subheader" className={styles.headerTitle}>
                                {t("common:history")}
                            </ListSubheader>
                            <Tooltip title="Wipe whole translation history">
                                <Button
                                    onClick={() => {
                                        if (!confirm('Are you sure to remove unstarred items from history?')) return

                                        let filteredHistory = getHistory().filter((item) => item.star)

                                        localStorage.setItem('translationHistory', JSON.stringify(filteredHistory))
                                        setHistory(getHistory())
                                    }}
                                    color="error"
                                >
                                    <div>{t("common:removeEverything")}</div>
                                    <DeleteForeverIcon />
                                </Button>
                            </Tooltip>
                        </div>
                    }
                >
                    {history
                        .sort((a, b) => (a.star ? -1 : b.star ? 1 : 0))
                        .map((value, index) => (
                            <div key={index} className={styles.historyItem}>
                                <Tooltip title={value.star ? t("common:markAsNotFavorite") : t("common:markAsFavorite")}>
                                    {value.star ? (
                                        <Button
                                            onClick={() => {
                                                changeStarInHistory(value, false)
                                                setHistory(getHistory())
                                            }}
                                        >
                                            <StarIcon />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                changeStarInHistory(value, true)
                                                setHistory(getHistory())
                                            }}
                                        >
                                            <StarBorderIcon />
                                        </Button>
                                    )}
                                </Tooltip>
                                <ListItemButton onClick={() => selectItem(value)} className={styles.listItemText}>
                                    <div>{value.fromLanguageId}</div>
                                    <ArrowRightAltIcon />
                                    <div>{value.toLanguageId}</div>
                                    <ArrowRightIcon />
                                    <div className={styles.valueText}>{value.text}</div>
                                </ListItemButton>
                                <Tooltip title={t("common:remove")}>
                                    <Button
                                        onClick={() => {
                                            removeItemFromHistory(value)
                                            setHistory(getHistory())
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Tooltip>
                            </div>
                        ))}
                </List>
            </Drawer>
        </div>
    )
}
